export type SocialPlatform = "tiktok" | "x";

export type SocialPostCheckResult = {
  ok: boolean;
  platform: SocialPlatform | null;
  postUrl: string;
  embedHtml: string | null;
  authorName: string | null;
  authorUrl: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  error: string | null;
};

function detectPlatform(url: string): SocialPlatform | null {
  let host: string;
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    host = new URL(withProtocol).hostname.replace(/^www\./, "").replace(/^vm\./, "");
  } catch {
    return null;
  }
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "twitter.com" || host === "x.com" || host.endsWith(".twitter.com") || host.endsWith(".x.com")) {
    return "x";
  }
  return null;
}

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// Script tags in oEmbed html never execute via dangerouslySetInnerHTML —
// the actual platform widget script is loaded once, separately, by the
// component that renders this html (see social-post-lightbox.tsx).
function stripScriptTags(html: string) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
}

function extractTweetText(html: string) {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const raw = match ? match[1] : "";
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

export async function checkSocialPost(inputUrl: string): Promise<SocialPostCheckResult> {
  const platform = detectPlatform(inputUrl);
  if (!platform) {
    return {
      ok: false,
      platform: null,
      postUrl: inputUrl,
      embedHtml: null,
      authorName: null,
      authorUrl: null,
      caption: null,
      thumbnailUrl: null,
      error: "URL harus dari TikTok atau X (Twitter).",
    };
  }

  const postUrl = normalizeUrl(inputUrl);
  const oembedEndpoint =
    platform === "tiktok"
      ? `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`
      : `https://publish.twitter.com/oembed?url=${encodeURIComponent(postUrl)}&omit_script=true`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(oembedEndpoint, { signal: controller.signal });
    const contentType = res.headers.get("content-type") ?? "";

    if (!res.ok || !contentType.includes("json")) {
      return {
        ok: false,
        platform,
        postUrl,
        embedHtml: null,
        authorName: null,
        authorUrl: null,
        caption: null,
        thumbnailUrl: null,
        error: "Post tidak ditemukan — mungkin sudah dihapus, private, atau salah link.",
      };
    }

    const data = await res.json();
    const html = stripScriptTags(data.html ?? "");
    if (!html) {
      return {
        ok: false,
        platform,
        postUrl,
        embedHtml: null,
        authorName: null,
        authorUrl: null,
        caption: null,
        thumbnailUrl: null,
        error: "Platform tidak mengembalikan embed untuk post ini.",
      };
    }

    return {
      ok: true,
      platform,
      postUrl: data.url ?? postUrl,
      embedHtml: html,
      authorName: data.author_name ?? null,
      authorUrl: data.author_url ?? null,
      caption: platform === "tiktok" ? (data.title ?? null) : extractTweetText(html),
      thumbnailUrl: data.thumbnail_url ?? null,
      error: null,
    };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      platform,
      postUrl,
      embedHtml: null,
      authorName: null,
      authorUrl: null,
      caption: null,
      thumbnailUrl: null,
      error: timedOut ? "Waktu tunggu habis saat menghubungi platform." : "Gagal memeriksa post ini.",
    };
  } finally {
    clearTimeout(timer);
  }
}
