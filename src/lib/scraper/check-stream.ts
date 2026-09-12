const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export type StreamCheckResult = {
  ok: boolean;
  streamUrl: string;
  contentType: string | null;
  detectedName: string | null;
  detectedGenre: string | null;
  bitrateKbps: number | null;
  error: string | null;
};

function normalizeUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(withProtocol).toString();
}

function isPlaylistFile(contentType: string | null, url: string) {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("scpls") || ct.includes("x-mpegurl") && !/\.m3u8(\?|$)/i.test(url)) return true;
  return /\.(pls|m3u)(\?|$)/i.test(url) && !/\.m3u8(\?|$)/i.test(url);
}

/** .pls / classic .m3u files are tiny text redirects to the real audio stream. */
function extractStreamUrlFromPlaylist(text: string): string | null {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const plsMatch = line.match(/^File\d*=(https?:\/\/.+)$/i);
    if (plsMatch) return plsMatch[1].trim();
    if (/^https?:\/\//i.test(line)) return line;
  }
  return null;
}

function looksLikeAudio(contentType: string | null) {
  if (!contentType) return false;
  return contentType.toLowerCase().split(";")[0].trim().startsWith("audio/");
}

async function probe(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
        "Icy-MetaData": "1",
      },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkStream(inputUrl: string): Promise<StreamCheckResult> {
  let streamUrl: string;
  try {
    streamUrl = normalizeUrl(inputUrl);
  } catch {
    return {
      ok: false,
      streamUrl: inputUrl,
      contentType: null,
      detectedName: null,
      detectedGenre: null,
      bitrateKbps: null,
      error: "URL tidak valid.",
    };
  }

  try {
    let res = await probe(streamUrl, 8000);
    let contentType = res.headers.get("content-type");

    // A playlist file redirects to the real stream — read the (tiny) body,
    // pull the audio URL out of it, then probe that instead.
    if (isPlaylistFile(contentType, streamUrl)) {
      const text = await res.text();
      const resolved = extractStreamUrlFromPlaylist(text);
      if (!resolved) {
        return {
          ok: false,
          streamUrl,
          contentType,
          detectedName: null,
          detectedGenre: null,
          bitrateKbps: null,
          error: "URL ini adalah file playlist, tapi tidak ditemukan URL stream di dalamnya.",
        };
      }
      streamUrl = resolved;
      res = await probe(streamUrl, 8000);
      contentType = res.headers.get("content-type");
    }

    const icyName = res.headers.get("icy-name");
    const icyGenre = res.headers.get("icy-genre");
    const icyBr = res.headers.get("icy-br");
    // We only need the headers — cancel rather than download the (infinite) stream body.
    res.body?.cancel().catch(() => {});

    if (!res.ok) {
      return {
        ok: false,
        streamUrl,
        contentType,
        detectedName: icyName,
        detectedGenre: icyGenre,
        bitrateKbps: icyBr ? Number(icyBr) : null,
        error: `Server merespons status ${res.status}`,
      };
    }

    const isHls = /\.m3u8(\?|$)/i.test(streamUrl) || (contentType ?? "").includes("mpegurl");
    if (!looksLikeAudio(contentType) && !isHls && !icyName) {
      return {
        ok: false,
        streamUrl,
        contentType,
        detectedName: icyName,
        detectedGenre: icyGenre,
        bitrateKbps: icyBr ? Number(icyBr) : null,
        error: `Respons bukan audio stream (content-type: ${contentType ?? "tidak diketahui"}).`,
      };
    }

    return {
      ok: true,
      streamUrl,
      contentType,
      detectedName: icyName,
      detectedGenre: icyGenre,
      bitrateKbps: icyBr ? Number(icyBr) : null,
      error: null,
    };
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return {
      ok: false,
      streamUrl,
      contentType: null,
      detectedName: null,
      detectedGenre: null,
      bitrateKbps: null,
      error: timedOut
        ? "Waktu tunggu habis — server stream tidak merespons."
        : err instanceof Error
          ? err.message
          : "Gagal mengakses stream.",
    };
  }
}
