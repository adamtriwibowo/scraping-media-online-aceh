"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { radioStations } from "@/db/schema";

const radioSchema = z.object({
  name: z.string().min(2).max(200),
  frequency: z.string().max(50).optional(),
  streamUrl: z.string().url(),
  websiteUrl: z.union([z.string().url(), z.literal("")]).optional(),
  genre: z.string().max(100).optional(),
  city: z.string().min(2).max(100),
  active: z.coerce.boolean().optional().default(true),
});

export async function createRadioStation(formData: FormData) {
  const parsed = radioSchema.safeParse({
    name: formData.get("name"),
    frequency: formData.get("frequency") || "",
    streamUrl: formData.get("streamUrl"),
    websiteUrl: formData.get("websiteUrl") || "",
    genre: formData.get("genre") || "",
    city: formData.get("city") || "Banda Aceh",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();

  const [existing] = await db
    .select({ id: radioStations.id })
    .from(radioStations)
    .where(eq(radioStations.streamUrl, parsed.data.streamUrl));
  if (existing) {
    return { error: "Stream dengan URL ini sudah terdaftar di database." };
  }

  await db.insert(radioStations).values({
    name: parsed.data.name,
    frequency: parsed.data.frequency || null,
    streamUrl: parsed.data.streamUrl,
    websiteUrl: parsed.data.websiteUrl || null,
    genre: parsed.data.genre || null,
    city: parsed.data.city,
    active: parsed.data.active,
  });

  revalidatePath("/admin/radio");
  revalidatePath("/radio");
  return { ok: true };
}

export async function updateRadioStation(id: number, formData: FormData) {
  const parsed = radioSchema.safeParse({
    name: formData.get("name"),
    frequency: formData.get("frequency") || "",
    streamUrl: formData.get("streamUrl"),
    websiteUrl: formData.get("websiteUrl") || "",
    genre: formData.get("genre") || "",
    city: formData.get("city") || "Banda Aceh",
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();
  await db
    .update(radioStations)
    .set({
      name: parsed.data.name,
      frequency: parsed.data.frequency || null,
      streamUrl: parsed.data.streamUrl,
      websiteUrl: parsed.data.websiteUrl || null,
      genre: parsed.data.genre || null,
      city: parsed.data.city,
      active: parsed.data.active,
      updatedAt: new Date(),
    })
    .where(eq(radioStations.id, id));

  revalidatePath("/admin/radio");
  revalidatePath("/radio");
  return { ok: true };
}

export async function deleteRadioStation(id: number) {
  const db = getDb();
  await db.delete(radioStations).where(eq(radioStations.id, id));
  revalidatePath("/admin/radio");
  revalidatePath("/radio");
}

export async function toggleRadioStationActive(id: number, active: boolean) {
  const db = getDb();
  await db.update(radioStations).set({ active, updatedAt: new Date() }).where(eq(radioStations.id, id));
  revalidatePath("/admin/radio");
  revalidatePath("/radio");
}
