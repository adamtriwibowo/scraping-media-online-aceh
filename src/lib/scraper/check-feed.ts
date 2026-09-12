import * as cheerio from "cheerio";
import { fetchWithTimeout } from "./fetch-with-timeout";
import { scrapeRss } from "./rss";
import { scrapeHomepage } from "./html";

export type FeedCheckResult = {
  ok: boolean;
  method: "rss" | "html" | null;
  siteUrl: string;
  feedUrl: string | null;
  itemCount: number;
  sample: { title: string; url: string }[];
  detectedName: string | null;
  error: string | null;
};

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  // Drop the trailing slash URL.toString() adds to a bare root path, so a
  // root URL round-trips to the same string a human (or the seed data) would
  // have typed — otherwise duplicate checks against stored site URLs miss.
  if (parsed.pathname === "/") {
    return `${parsed.origin}${parsed.search}${parsed.hash}`;
  }
  return parsed.toString();
}

function cleanTitle(raw: string) {
  const cdataMatch = raw.match(/^<!\[CDATA\[([\s\S]*)\]\]>$/);
  return (cdataMatch ? cdataMatch[1] : raw).trim();
}

const COMMON_FEED_PATHS = ["feed/", "feed", "rss", "rss.xml", "feed.xml", "atom.xml", "rss/feed"];

async function discoverFeedCandidates(siteUrl: string) {
  const origin = new URL(siteUrl).origin;
  const candidates = new Set<string>();
  let title: string | null = null;

  try {
    const res = await fetchWithTimeout(siteUrl);
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const rawTitle = $("title").first().text().trim();
      title = rawTitle ? cleanTitle(rawTitle) : null;
      $('link[type="application/rss+xml"], link[type="application/atom+xml"]').each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        try {
          candidates.add(new URL(href, siteUrl).toString());
        } catch {
          // ignore malformed href
        }
      });
    }
  } catch {
    // homepage unreachable — fall through to guessed paths
  }

  for (const suffix of COMMON_FEED_PATHS) {
    candidates.add(new URL(suffix, `${origin}/`).toString());
  }

  return { candidates: Array.from(candidates), title };
}

export async function checkFeed(inputUrl: string): Promise<FeedCheckResult> {
  let siteUrl: string;
  try {
    siteUrl = normalizeUrl(inputUrl);
  } catch {
    return {
      ok: false,
      method: null,
      siteUrl: inputUrl,
      feedUrl: null,
      itemCount: 0,
      sample: [],
      detectedName: null,
      error: "URL tidak valid.",
    };
  }

  const { candidates, title } = await discoverFeedCandidates(siteUrl);
  const attempts = [siteUrl, ...candidates];

  // Race every candidate concurrently rather than one after another — a
  // slow/unresponsive site would otherwise stack up to N * 12s of timeouts
  // in sequence (observed: a single check taking 107s against 8 candidates).
  const race = attempts.map(async (candidate) => {
    const items = await scrapeRss(candidate);
    if (items.length === 0) throw new Error("empty feed");
    return { candidate, items };
  });

  try {
    const { candidate, items } = await Promise.any(race);
    return {
      ok: true,
      method: "rss",
      siteUrl,
      feedUrl: candidate,
      itemCount: items.length,
      sample: items.slice(0, 5).map((i) => ({ title: i.title, url: i.url })),
      detectedName: title,
      error: null,
    };
  } catch {
    // every candidate failed or came back empty — fall through to HTML scraping
  }

  try {
    const items = await scrapeHomepage(siteUrl);
    if (items.length > 0) {
      return {
        ok: true,
        method: "html",
        siteUrl,
        feedUrl: null,
        itemCount: items.length,
        sample: items.slice(0, 5).map((i) => ({ title: i.title, url: i.url })),
        detectedName: title,
        error: null,
      };
    }
    return {
      ok: false,
      method: null,
      siteUrl,
      feedUrl: null,
      itemCount: 0,
      sample: [],
      detectedName: title,
      error: "Tidak ditemukan RSS feed maupun judul berita yang bisa dikenali dari halaman ini.",
    };
  } catch (err) {
    return {
      ok: false,
      method: null,
      siteUrl,
      feedUrl: null,
      itemCount: 0,
      sample: [],
      detectedName: title,
      error: err instanceof Error ? err.message : "Gagal mengakses URL tersebut.",
    };
  }
}
