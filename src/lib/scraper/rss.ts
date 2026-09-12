import Parser from "rss-parser";
import { fetchWithTimeout } from "./fetch-with-timeout";
import type { ScrapedItem } from "./types";

// The feed XML is always fetched via fetchWithTimeout below and handed to
// parseString, so this instance never issues its own HTTP requests — no
// headers/timeout options apply here (those only affect parser.parseURL).
const parser = new Parser();

function extractImage(item: Parser.Item & Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;

  const mediaContent = item["media:content"] as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  const contentEncoded = (item["content:encoded"] as string) || item.content || "";
  const match = contentEncoded.match(/<img[^>]+src="([^">]+)"/i);
  return match?.[1];
}

export async function scrapeRss(rssUrl: string, timeoutMs?: number): Promise<ScrapedItem[]> {
  const res = await fetchWithTimeout(rssUrl, timeoutMs);
  if (!res.ok) {
    throw new Error(`RSS fetch failed with status ${res.status}`);
  }
  const xml = await res.text();
  const feed = await parser.parseString(xml);

  return (feed.items || [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!.trim(),
      url: item.link!.trim(),
      snippet: (item.contentSnippet || item.summary || "").slice(0, 400) || undefined,
      imageUrl: extractImage(item),
      publishedAt: item.pubDate ? new Date(item.pubDate) : undefined,
    }));
}
