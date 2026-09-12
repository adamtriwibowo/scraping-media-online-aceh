"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Play, X as CloseIcon, Music2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SocialEmbed } from "@/components/social/social-embed";
import type { SocialPost } from "@/db/schema";

function CategoryFilter({ categories }: { categories: string[] }) {
  const searchParams = useSearchParams();
  const active = searchParams.get("category");

  return (
    <div className="flex flex-wrap items-center gap-2 border border-border p-4">
      <Link
        href="/media-sosial"
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
          href={`/media-sosial?category=${encodeURIComponent(category)}`}
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

function PlatformBadge({ platform }: { platform: "tiktok" | "x" }) {
  const isTiktok = platform === "tiktok";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] leading-none",
        isTiktok ? "bg-brass/90 text-primary-foreground" : "bg-teal/90 text-primary-foreground"
      )}
    >
      {isTiktok ? <Music2 className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />}
      {isTiktok ? "TikTok" : "X"}
    </span>
  );
}

function PostLightbox({ post, onClose }: { post: SocialPost; onClose: () => void }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col gap-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <PlatformBadge platform={post.platform} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-8 w-8 shrink-0 items-center justify-center border border-white/20 text-paper hover:border-brass hover:text-brass"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-y-auto bg-paper p-1">
          <SocialEmbed platform={post.platform} html={post.embedHtml} className="mx-auto" />
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onOpen }: { post: SocialPost; onOpen: () => void }) {
  const [thumbFailed, setThumbFailed] = useState(false);

  if (post.platform === "tiktok" && post.thumbnailUrl && !thumbFailed) {
    return (
      <button type="button" onClick={onOpen} className="group flex flex-col gap-2 text-left">
        <div className="relative aspect-[9/16] w-full overflow-hidden border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.thumbnailUrl}
            alt=""
            onError={() => setThumbFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/30">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brass text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
            </span>
          </div>
          <span className="absolute left-2 top-2">
            <PlatformBadge platform="tiktok" />
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="line-clamp-2 text-sm leading-snug text-ink group-hover:text-brass">
            {post.caption ?? "Lihat post"}
          </span>
          {post.authorName && <span className="text-xs text-muted-foreground">@{post.authorName}</span>}
        </div>
      </button>
    );
  }

  // X posts (and any TikTok whose signed thumbnail URL has expired) get a
  // text-forward quote card instead of a broken/missing image.
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col gap-3 border border-border p-4 text-left transition-colors hover:border-teal"
    >
      <PlatformBadge platform={post.platform} />
      <p className="line-clamp-5 flex-1 text-[15px] leading-snug text-ink">
        {post.caption ?? "Lihat post ini"}
      </p>
      {post.authorName && (
        <span className="text-xs text-muted-foreground group-hover:text-teal-strong">
          {post.platform === "x" ? "@" : ""}
          {post.authorName}
        </span>
      )}
    </button>
  );
}

export function SocialPostGrid({ posts, categories }: { posts: SocialPost[]; categories: string[] }) {
  const [selected, setSelected] = useState<SocialPost | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <CategoryFilter categories={categories} />

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-ink">Belum ada post ditemukan</p>
          <p className="text-xs text-muted-foreground">Coba ubah filter kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onOpen={() => setSelected(post)} />
          ))}
        </div>
      )}

      {selected && <PostLightbox post={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
