import { FeedChecker } from "@/components/admin/feed-checker";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cek Feed" };

export default function CekFeedPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Cek Feed</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Periksa apakah sebuah situs berita punya RSS feed yang bisa diambil, atau minimal judul
          berita yang bisa dikenali dari halaman utamanya, sebelum menambahkannya sebagai sumber
          scraping.
        </p>
      </div>

      <FeedChecker />
    </div>
  );
}
