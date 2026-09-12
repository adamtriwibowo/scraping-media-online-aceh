"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { videos } from "@/db/schema";
import { extractYoutubeId } from "@/lib/scraper/check-video";

const videoSchema = z.object({
  title: z.string().min(2).max(300),
  youtubeUrl: z.string().url(),
  thumbnailUrl: z.union([z.string().url(), z.literal("")]).optional(),
  channelName: z.string().max(200).optional(),
  category: z.string().min(2).max(100),
  active: z.coerce.boolean().optional().default(true),
});

export async function createVideo(formData: FormData) {
  const parsed = videoSchema.safeParse({
    title: formData.get("title"),
    youtubeUrl: formData.get("youtubeUrl"),
    thumbnailUrl: formData.get("thumbnailUrl") || "",
    channelName: formData.get("channelName") || "",
    category: formData.get("category") || "Berita",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const youtubeId = extractYoutubeId(parsed.data.youtubeUrl);
  if (!youtubeId) {
    return { error: "URL bukan link video YouTube yang valid." };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: videos.id })
    .from(videos)
    .where(eq(videos.youtubeId, youtubeId));
  if (existing) {
    return { error: "Video ini sudah terdaftar di database." };
  }

  await db.insert(videos).values({
    title: parsed.data.title,
    youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
    youtubeId,
    thumbnailUrl: parsed.data.thumbnailUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    channelName: parsed.data.channelName || null,
    category: parsed.data.category,
    active: parsed.data.active,
  });

  revalidatePath("/admin/video");
  revalidatePath("/video");
  return { ok: true };
}

export async function updateVideo(id: number, formData: FormData) {
  const parsed = videoSchema.safeParse({
    title: formData.get("title"),
    youtubeUrl: formData.get("youtubeUrl"),
    thumbnailUrl: formData.get("thumbnailUrl") || "",
    channelName: formData.get("channelName") || "",
    category: formData.get("category") || "Berita",
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const youtubeId = extractYoutubeId(parsed.data.youtubeUrl);
  if (!youtubeId) {
    return { error: "URL bukan link video YouTube yang valid." };
  }

  const db = getDb();
  await db
    .update(videos)
    .set({
      title: parsed.data.title,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      youtubeId,
      thumbnailUrl: parsed.data.thumbnailUrl || `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
      channelName: parsed.data.channelName || null,
      category: parsed.data.category,
      active: parsed.data.active,
      updatedAt: new Date(),
    })
    .where(eq(videos.id, id));

  revalidatePath("/admin/video");
  revalidatePath("/video");
  return { ok: true };
}

export async function deleteVideo(id: number) {
  const db = getDb();
  await db.delete(videos).where(eq(videos.id, id));
  revalidatePath("/admin/video");
  revalidatePath("/video");
}

export async function toggleVideoActive(id: number, active: boolean) {
  const db = getDb();
  await db.update(videos).set({ active, updatedAt: new Date() }).where(eq(videos.id, id));
  revalidatePath("/admin/video");
  revalidatePath("/video");
}
