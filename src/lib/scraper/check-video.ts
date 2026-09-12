export type VideoCheckResult = {
  ok: boolean;
  youtubeUrl: string;
  youtubeId: string | null;
  title: string | null;
  channelName: string | null;
  thumbnailUrl: string | null;
  error: string | null;
};

/** Accepts watch/short/youtu.be/embed URLs (with or without protocol) and pulls the 11-char video id out. */
export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");
  const idPattern = /^[a-zA-Z0-9_-]{11}$/;

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return idPattern.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id && idPattern.test(id) ? id : null;
    }
    const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
    const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    const liveMatch = url.pathname.match(/^\/live\/([a-zA-Z0-9_-]{11})/);
    if (liveMatch) return liveMatch[1];
  }

  return null;
}

type OEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

export async function checkVideo(inputUrl: string): Promise<VideoCheckResult> {
  const youtubeId = extractYoutubeId(inputUrl);
  if (!youtubeId) {
    return {
      ok: false,
      youtubeUrl: inputUrl,
      youtubeId: null,
      title: null,
      channelName: null,
      thumbnailUrl: null,
      error: "URL bukan link video YouTube yang valid (watch, youtu.be, shorts, atau embed).",
    };
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(oembedUrl, { signal: controller.signal });
    if (!res.ok) {
      return {
        ok: false,
        youtubeUrl: canonicalUrl,
        youtubeId,
        title: null,
        channelName: null,
        thumbnailUrl: null,
        error:
          res.status === 404
            ? "Video tidak ditemukan — mungkin sudah dihapus, private, atau salah link."
            : `YouTube merespons status ${res.status}`,
      };
    }
    const data = (await res.json()) as OEmbedResponse;
    return {
      ok: true,
      youtubeUrl: canonicalUrl,
      youtubeId,
      title: data.title ?? null,
      channelName: data.author_name ?? null,
      thumbnailUrl: data.thumbnail_url ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      error: null,
    };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      youtubeUrl: canonicalUrl,
      youtubeId,
      title: null,
      channelName: null,
      thumbnailUrl: null,
      error: timedOut ? "Waktu tunggu habis saat menghubungi YouTube." : "Gagal memeriksa video ini.",
    };
  } finally {
    clearTimeout(timer);
  }
}
