import { getVideos, getVideoCategories } from "@/lib/queries";
import { VideoGrid } from "@/components/video/video-grid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Video" };

export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [videos, categories] = await Promise.all([
    getVideos({ activeOnly: true, category: params.category }),
    getVideoCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Video</h1>
        <p className="text-sm text-muted-foreground">
          Kumpulan video seputar Aceh — berita, budaya, wisata, dan lainnya.
        </p>
      </div>

      <VideoGrid videos={videos} categories={categories} />
    </div>
  );
}
