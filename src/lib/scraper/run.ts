import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { articles, keywords, scrapeJobs, scrapeLogs, sites } from "@/db/schema";
import { scrapeRss } from "./rss";
import { scrapeHomepage } from "./html";
import { matchKeywords } from "./keywords";
import { getSettings } from "@/lib/settings";
import type { ScrapedItem } from "./types";

async function processSite(
  site: typeof sites.$inferSelect,
  activeKeywords: typeof keywords.$inferSelect[],
  timeoutMs: number
) {
  const db = getDb();
  let items: ScrapedItem[] = [];

  try {
    items = site.rssUrl
      ? await scrapeRss(site.rssUrl, timeoutMs)
      : await scrapeHomepage(site.url, timeoutMs);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown scraping error";
    await db
      .update(sites)
      .set({ lastError: message, lastErrorAt: new Date(), updatedAt: new Date() })
      .where(eq(sites.id, site.id));
    return { siteId: site.id, status: "error" as const, found: 0, inserted: 0, message };
  }

  let inserted = 0;
  if (items.length > 0) {
    const rows = items.map((item) => ({
      siteId: site.id,
      title: item.title,
      url: item.url,
      snippet: item.snippet,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      matchedKeywords: matchKeywords(item.title, activeKeywords),
    }));

    const inserted_rows = await db
      .insert(articles)
      .values(rows)
      .onConflictDoNothing({ target: articles.url })
      .returning({ id: articles.id });
    inserted = inserted_rows.length;
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.siteId, site.id));

  await db
    .update(sites)
    .set({
      articleCount: count,
      lastScrapedAt: new Date(),
      lastError: null,
      lastErrorAt: null,
      updatedAt: new Date(),
    })
    .where(eq(sites.id, site.id));

  return {
    siteId: site.id,
    status: "success" as const,
    found: items.length,
    inserted,
    message: null as string | null,
  };
}

async function runInBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>) {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export async function runScrapeJob(trigger: "cron" | "manual") {
  const db = getDb();
  const settings = await getSettings();

  const [job] = await db
    .insert(scrapeJobs)
    .values({ trigger, status: "running" })
    .returning();

  const activeSites = await db.select().from(sites).where(eq(sites.active, true));
  const activeKeywords = await db.select().from(keywords).where(eq(keywords.active, true));

  const results = await runInBatches(activeSites, settings.scrapeConcurrency, (site) =>
    processSite(site, activeKeywords, settings.scrapeTimeoutMs)
  );

  const logsToInsert = results.map((r) => ({
    jobId: job.id,
    siteId: r.siteId,
    status: r.status,
    articlesFound: r.found,
    articlesNew: r.inserted,
    message: r.message,
  }));
  if (logsToInsert.length > 0) {
    await db.insert(scrapeLogs).values(logsToInsert);
  }

  const totalFound = results.reduce((sum, r) => sum + r.found, 0);
  const totalNew = results.reduce((sum, r) => sum + r.inserted, 0);
  const hasErrors = results.some((r) => r.status === "error");
  const allErrors = results.length > 0 && results.every((r) => r.status === "error");

  await db
    .update(scrapeJobs)
    .set({
      status: allErrors ? "error" : hasErrors ? "partial" : "success",
      sitesProcessed: results.length,
      articlesFound: totalFound,
      articlesNew: totalNew,
      finishedAt: new Date(),
    })
    .where(eq(scrapeJobs.id, job.id));

  return {
    jobId: job.id,
    sitesProcessed: results.length,
    articlesFound: totalFound,
    articlesNew: totalNew,
    errors: results.filter((r) => r.status === "error").length,
  };
}
