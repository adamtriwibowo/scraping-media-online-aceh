import { getSocialPosts, getSocialPostCategories } from "@/lib/queries";
import { SocialPostGrid } from "@/components/social/social-post-grid";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Media Sosial" };

export default async function MediaSosialPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [posts, categories] = await Promise.all([
    getSocialPosts({ activeOnly: true, category: params.category }),
    getSocialPostCategories(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Media Sosial</h1>
        <p className="text-sm text-muted-foreground">
          Kiriman TikTok &amp; X seputar Aceh, dikurasi langsung dari sumbernya.
        </p>
      </div>

      <SocialPostGrid posts={posts} categories={categories} />
    </div>
  );
}
