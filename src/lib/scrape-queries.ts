import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { scrapeJobs, scrapeLogs, sites } from "@/db/schema";

export async function getRecentScrapeJobs(limit = 20) {
  const db = getDb();
  return db.select().from(scrapeJobs).orderBy(desc(scrapeJobs.startedAt)).limit(limit);
}

export async function getScrapeLogsForJob(jobId: number) {
  const db = getDb();
  return db
    .select({
      id: scrapeLogs.id,
      status: scrapeLogs.status,
      articlesFound: scrapeLogs.articlesFound,
      articlesNew: scrapeLogs.articlesNew,
      message: scrapeLogs.message,
      createdAt: scrapeLogs.createdAt,
      siteName: sites.name,
    })
    .from(scrapeLogs)
    .leftJoin(sites, eq(scrapeLogs.siteId, sites.id))
    .where(eq(scrapeLogs.jobId, jobId))
    .orderBy(desc(scrapeLogs.id));
}
