"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { keywords } from "@/db/schema";

const keywordSchema = z.object({
  word: z.string().min(2).max(150),
  label: z.string().max(150).optional(),
  active: z.coerce.boolean().optional().default(true),
});

export async function createKeyword(formData: FormData) {
  const parsed = keywordSchema.safeParse({
    word: formData.get("word"),
    label: formData.get("label") || undefined,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();
  await db.insert(keywords).values({
    word: parsed.data.word,
    label: parsed.data.label || null,
    active: parsed.data.active,
  });

  revalidatePath("/admin/keywords");
  revalidatePath("/keywords");
  return { ok: true };
}

export async function updateKeyword(id: number, formData: FormData) {
  const parsed = keywordSchema.safeParse({
    word: formData.get("word"),
    label: formData.get("label") || undefined,
    active: formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const db = getDb();
  await db
    .update(keywords)
    .set({ word: parsed.data.word, label: parsed.data.label || null, active: parsed.data.active })
    .where(eq(keywords.id, id));

  revalidatePath("/admin/keywords");
  revalidatePath("/keywords");
  return { ok: true };
}

export async function deleteKeyword(id: number) {
  const db = getDb();
  await db.delete(keywords).where(eq(keywords.id, id));
  revalidatePath("/admin/keywords");
  revalidatePath("/keywords");
}

export async function toggleKeywordActive(id: number, active: boolean) {
  const db = getDb();
  await db.update(keywords).set({ active }).where(eq(keywords.id, id));
  revalidatePath("/admin/keywords");
  revalidatePath("/keywords");
}
