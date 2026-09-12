"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Play, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Video } from "@/db/schema";

function CategoryFilter({ categories }: { categories: string[] }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  return (
    <div className="flex flex-wrap items-center gap-2 border border-border p-4">
      <Link
        href="/video"
        className={cn(
          "border px-3 py-1.5 text-sm transition-colors",
          !active ? "border-brass bg-brass/10 text-brass-strong" : "border-border text-muted-foreground hover:border-ink hover:text-ink"
        )}
      >
        Semua
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/video?category=${encodeURIComponent(category)}`}
          className={cn(
            "border px-3 py-1.5 text-sm transition-colors",
            active === category
              ? "border-brass bg-brass/10 text-brass-strong"
              : "border-border text-muted-foreground hover:border-ink hover:text-ink"
          )}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}

function VideoLightbox({ video, onClose }: { video: Video; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
      onClick={onClose}
    >
      <div className="flex w-full max-w-4xl flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm text-paper">{video.title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/20 text-paper hover:border-brass hover:text-brass"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

export function VideoGrid({ videos, categories }: { videos: Video[]; categories: string[] }) {
  const [selected, setSelected] = useState<Video | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <CategoryFilter categories={categories} />

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-ink">Belum ada video ditemukan</p>
          <p className="text-xs text-muted-foreground">Coba ubah filter kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <button
              key={video.id}
              type="button"
              onClick={() => setSelected(video)}
              className="group flex flex-col gap-2 text-left"
            >
              <div className="relative aspect-video w-full overflow-hidden border border-border bg-muted">
                {video.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnailUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/30">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  </span>
                </div>
                <span className="absolute left-2 top-2 bg-brass/90 px-1.5 py-0.5 text-[11px] leading-none text-primary-foreground">
                  {video.category}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="line-clamp-2 font-medium leading-snug text-ink group-hover:text-brass">
                  {video.title}
                </span>
                {video.channelName && (
                  <span className="text-xs text-muted-foreground">{video.channelName}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <VideoLightbox video={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
