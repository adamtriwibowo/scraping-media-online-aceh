"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { sites } from "@/db/schema";

const siteSchema = z.object({
  name: z.string().min(2).max(200),
  url: z.string().url(),
  rssUrl: z.union([z.string().url(), z.literal("")]).optional(),
  category: z.enum(["lokal", "nasional"]),
  active: z.coerce.boolean().optional().default(true),
});

export async function createSite(formData: FormData) {
  const parsed = siteSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    rssUrl: formData.get("rssUrl") || "",
    category: formData.get("category"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();
  await db.insert(sites).values({
    name: parsed.data.name,
    url: parsed.data.url,
    rssUrl: parsed.data.rssUrl || null,
    category: parsed.data.category,
    active: parsed.data.active,
  });

  revalidatePath("/admin/websites");
  revalidatePath("/websites");
  return { ok: true };
}

export async function updateSite(id: number, formData: FormData) {
  const parsed = siteSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    rssUrl: formData.get("rssUrl") || "",
    category: formData.get("category"),
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();
  await db
    .update(sites)
    .set({
      name: parsed.data.name,
      url: parsed.data.url,
      rssUrl: parsed.data.rssUrl || null,
      category: parsed.data.category,
      active: parsed.data.active,
      updatedAt: new Date(),
    })
    .where(eq(sites.id, id));

  revalidatePath("/admin/websites");
  revalidatePath("/websites");
  return { ok: true };
}

export async function deleteSite(id: number) {
  const db = getDb();
  await db.delete(sites).where(eq(sites.id, id));
  revalidatePath("/admin/websites");
  revalidatePath("/websites");
}

export async function toggleSiteActive(id: number, active: boolean) {
  const db = getDb();
  await db.update(sites).set({ active, updatedAt: new Date() }).where(eq(sites.id, id));
  revalidatePath("/admin/websites");
  revalidatePath("/websites");
}
