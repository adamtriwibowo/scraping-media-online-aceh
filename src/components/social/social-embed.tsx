"use client";

import { useEffect, useRef } from "react";
import type { SocialPlatform } from "@/lib/scraper/check-social";

const SCRIPT_SRC: Record<SocialPlatform, string> = {
  tiktok: "https://www.tiktok.com/embed.js",
  x: "https://platform.x.com/widgets.js",
};

type TwttrGlobal = { widgets: { load: (el?: HTMLElement) => void } };

/**
 * Renders a platform oEmbed snippet (stripped of its own <script> tag, which
 * never executes via innerHTML anyway) and loads the widget script that
 * turns the blockquote into the real player/card.
 */
export function SocialEmbed({ platform, html, className }: { platform: SocialPlatform; html: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (platform === "x") {
      const w = window as typeof window & { twttr?: TwttrGlobal };
      const loadTweets = () => {
        if (containerRef.current) w.twttr?.widgets.load(containerRef.current);
      };
      if (w.twttr) {
        loadTweets();
        return;
      }
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC.x}"]`);
      if (existing) {
        existing.addEventListener("load", loadTweets, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = SCRIPT_SRC.x;
      script.async = true;
      script.addEventListener("load", loadTweets, { once: true });
      document.body.appendChild(script);
      return;
    }

    // TikTok's embed.js scans the DOM for .tiktok-embed blockquotes on
    // execution — appending a fresh copy each time is the standard way to
    // make it pick up a blockquote that was inserted after the first load.
    const script = document.createElement("script");
    script.src = SCRIPT_SRC.tiktok;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [platform, html]);

  return <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
