import * as cheerio from "cheerio";
import { fetchWithTimeout } from "./fetch-with-timeout";
import type { ScrapedItem } from "./types";

const ARTICLE_LINK_SELECTORS = [
  "article a[href]",
  "h1 a[href]",
  "h2 a[href]",
  "h3 a[href]",
  ".post-title a[href]",
  ".entry-title a[href]",
];

function resolveUrl(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

/**
 * Best-effort fallback for sites without an RSS feed: pulls headline-like
 * anchors from the homepage. Heuristic, not guaranteed to match every layout.
 */
export async function scrapeHomepage(siteUrl: string): Promise<ScrapedItem[]> {
  const res = await fetchWithTimeout(siteUrl);
  if (!res.ok) {
    throw new Error(`Homepage fetch failed with status ${res.status}`);
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  const seen = new Map<string, ScrapedItem>();

  for (const selector of ARTICLE_LINK_SELECTORS) {
    $(selector).each((_, el) => {
      const href = $(el).attr("href");
      const title = $(el).text().trim().replace(/\s+/g, " ");
      if (!href || !title || title.length < 12) return;

      const absoluteUrl = resolveUrl(href, siteUrl);
      if (!absoluteUrl) return;
      if (!absoluteUrl.startsWith(new URL(siteUrl).origin)) return;
      if (seen.has(absoluteUrl)) return;

      seen.set(absoluteUrl, { title, url: absoluteUrl });
    });
    if (seen.size >= 40) break;
  }

  return Array.from(seen.values()).slice(0, 40);
}
