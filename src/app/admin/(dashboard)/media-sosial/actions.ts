"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { socialPosts } from "@/db/schema";

const socialPostSchema = z.object({
  platform: z.enum(["tiktok", "x"]),
  postUrl: z.string().url(),
  embedHtml: z.string().min(1),
  authorName: z.string().max(200).optional(),
  authorUrl: z.union([z.string().url(), z.literal("")]).optional(),
  caption: z.string().max(2000).optional(),
  thumbnailUrl: z.union([z.string().url(), z.literal("")]).optional(),
  category: z.string().min(2).max(100),
  active: z.coerce.boolean().optional().default(true),
});

function readForm(formData: FormData) {
  return {
    platform: formData.get("platform"),
    postUrl: formData.get("postUrl"),
    embedHtml: formData.get("embedHtml"),
    authorName: formData.get("authorName") || "",
    authorUrl: formData.get("authorUrl") || "",
    caption: formData.get("caption") || "",
    thumbnailUrl: formData.get("thumbnailUrl") || "",
    category: formData.get("category") || "Berita",
    active: formData.get("active") === "on",
  };
}

export async function createSocialPost(formData: FormData) {
  const parsed = socialPostSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();
  const [existing] = await db
    .select({ id: socialPosts.id })
    .from(socialPosts)
    .where(eq(socialPosts.postUrl, parsed.data.postUrl));
  if (existing) {
    return { error: "Post ini sudah terdaftar di database." };
  }

  await db.insert(socialPosts).values({
    platform: parsed.data.platform,
    postUrl: parsed.data.postUrl,
    embedHtml: parsed.data.embedHtml,
    authorName: parsed.data.authorName || null,
    authorUrl: parsed.data.authorUrl || null,
    caption: parsed.data.caption || null,
    thumbnailUrl: parsed.data.thumbnailUrl || null,
    category: parsed.data.category,
    active: parsed.data.active,
  });

  revalidatePath("/admin/media-sosial");
  revalidatePath("/media-sosial");
  return { ok: true };
}

export async function updateSocialPost(id: number, formData: FormData) {
  const parsed = socialPostSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();
  await db
    .update(socialPosts)
    .set({
      platform: parsed.data.platform,
      postUrl: parsed.data.postUrl,
      embedHtml: parsed.data.embedHtml,
      authorName: parsed.data.authorName || null,
      authorUrl: parsed.data.authorUrl || null,
      caption: parsed.data.caption || null,
      thumbnailUrl: parsed.data.thumbnailUrl || null,
      category: parsed.data.category,
      active: parsed.data.active,
      updatedAt: new Date(),
    })
    .where(eq(socialPosts.id, id));

  revalidatePath("/admin/media-sosial");
  revalidatePath("/media-sosial");
  return { ok: true };
}

export async function deleteSocialPost(id: number) {
  const db = getDb();
  await db.delete(socialPosts).where(eq(socialPosts.id, id));
  revalidatePath("/admin/media-sosial");
  revalidatePath("/media-sosial");
}

export async function toggleSocialPostActive(id: number, active: boolean) {
  const db = getDb();
  await db.update(socialPosts).set({ active, updatedAt: new Date() }).where(eq(socialPosts.id, id));
  revalidatePath("/admin/media-sosial");
  revalidatePath("/media-sosial");
}
