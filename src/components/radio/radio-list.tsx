"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Play, Square, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RadioStation } from "@/db/schema";

export function RadioList({ stations }: { stations: RadioStation[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // The station currently loading/playing — set as soon as `play()` is
  // requested and confirmed/cleared once the audio element itself fires a
  // real "playing" or "error" event. Deciding this from the play() promise
  // instead is unreliable: many icecast streams reject that promise with a
  // transient AbortError while buffering, then start playing seconds later
  // regardless — reporting failure right away would be a false negative.
  const targetRef = useRef<RadioStation | null>(null);
  const [pending, setPending] = useState<RadioStation | null>(null);
  const [nowPlaying, setNowPlaying] = useState<RadioStation | null>(null);

  function play(station: RadioStation) {
    if (!audioRef.current) return;
    if (nowPlaying?.id === station.id || pending?.id === station.id) {
      stop();
      return;
    }
    targetRef.current = station;
    setNowPlaying(null);
    setPending(station);
    audioRef.current.src = station.streamUrl;
    audioRef.current.play().catch(() => {
      // Real success/failure is decided by the onPlaying/onError handlers below.
    });
  }

  function stop() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    targetRef.current = null;
    setPending(null);
    setNowPlaying(null);
  }

  if (stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-ink">Belum ada radio terdaftar</p>
        <p className="text-xs text-muted-foreground">
          Tambahkan stasiun radio lewat panel admin setelah dicek di &quot;Cek Stream&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <audio
        ref={audioRef}
        onPlaying={() => {
          setNowPlaying(targetRef.current);
          setPending(null);
        }}
        onError={() => {
          if (targetRef.current) {
            toast.error(`Gagal memutar "${targetRef.current.name}". Stream mungkin sedang offline.`);
          }
          targetRef.current = null;
          setPending(null);
          setNowPlaying(null);
        }}
        onEnded={() => setNowPlaying(null)}
      />

      <div className="divide-y divide-border border border-border">
        {stations.map((station) => {
          const isPlaying = nowPlaying?.id === station.id;
          const isPending = pending?.id === station.id;
          return (
            <div key={station.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => play(station)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isPlaying || isPending
                      ? "border-brass bg-brass text-primary-foreground"
                      : "border-border text-ink hover:border-brass hover:text-brass"
                  )}
                  aria-label={isPlaying || isPending ? `Hentikan ${station.name}` : `Putar ${station.name}`}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isPlaying ? (
                    <Square className="h-3.5 w-3.5" fill="currentColor" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  )}
                </button>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className={cn("font-medium", isPlaying || isPending ? "text-brass" : "text-ink")}>
                      {station.name}
                    </span>
                    {station.frequency && (
                      <span className="font-mono text-xs text-muted-foreground tabular-figures">
                        {station.frequency}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {[station.genre, station.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              {station.websiteUrl && (
                <a
                  href={station.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-brass"
                >
                  Situs resmi
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {(nowPlaying || pending) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-ink px-4 py-3 text-paper">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {pending ? (
                <Loader2 className="h-3 w-3 shrink-0 animate-spin text-brass" />
              ) : (
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brass opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brass" />
                </span>
              )}
              <p className="truncate text-sm">
                {pending ? "Menyambungkan" : "Sedang diputar"} —{" "}
                <span className="font-medium">{(nowPlaying ?? pending)!.name}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={stop}
              className="flex shrink-0 items-center gap-1.5 border border-white/20 px-3 py-1.5 text-xs hover:border-brass hover:text-brass"
            >
              <Square className="h-3 w-3" fill="currentColor" />
              Hentikan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
