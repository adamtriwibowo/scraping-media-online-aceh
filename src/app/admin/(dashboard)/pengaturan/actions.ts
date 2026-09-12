"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { appSettings } from "@/db/schema";
import { getSettings } from "@/lib/settings";

const credentialsSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newUsername: z.string().min(3, "Username minimal 3 karakter").max(100),
    newPassword: z.union([z.string().min(8, "Password baru minimal 8 karakter"), z.literal("")]),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === "" || data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export async function updateCredentials(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newUsername: formData.get("newUsername"),
    newPassword: formData.get("newPassword") || "",
    confirmPassword: formData.get("confirmPassword") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const settings = await getSettings();
  const currentPasswordValid = await bcrypt.compare(
    parsed.data.currentPassword,
    settings.adminPasswordHash
  );
  if (!currentPasswordValid) {
    return { error: "Password saat ini salah" };
  }

  const db = getDb();
  await db
    .update(appSettings)
    .set({
      adminUsername: parsed.data.newUsername,
      adminPasswordHash: parsed.data.newPassword
        ? bcrypt.hashSync(parsed.data.newPassword, 10)
        : settings.adminPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(appSettings.id, settings.id));

  revalidatePath("/admin/pengaturan");
  return { ok: true };
}

const scrapeSettingsSchema = z.object({
  scrapeConcurrency: z.coerce.number().int().min(1, "Minimal 1").max(20, "Maksimal 20"),
  scrapeTimeoutSeconds: z.coerce.number().int().min(3, "Minimal 3 detik").max(60, "Maksimal 60 detik"),
});

export async function updateScrapeSettings(formData: FormData) {
  const parsed = scrapeSettingsSchema.safeParse({
    scrapeConcurrency: formData.get("scrapeConcurrency"),
    scrapeTimeoutSeconds: formData.get("scrapeTimeoutSeconds"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const settings = await getSettings();
  const db = getDb();
  await db
    .update(appSettings)
    .set({
      scrapeConcurrency: parsed.data.scrapeConcurrency,
      scrapeTimeoutMs: parsed.data.scrapeTimeoutSeconds * 1000,
      updatedAt: new Date(),
    })
    .where(eq(appSettings.id, settings.id));

  revalidatePath("/admin/pengaturan");
  return { ok: true };
}

const siteInfoSchema = z.object({
  siteTitle: z.string().min(2, "Judul minimal 2 karakter").max(200),
  siteDescription: z.string().min(2, "Deskripsi minimal 2 karakter").max(300),
});

export async function updateSiteInfo(formData: FormData) {
  const parsed = siteInfoSchema.safeParse({
    siteTitle: formData.get("siteTitle"),
    siteDescription: formData.get("siteDescription"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const settings = await getSettings();
  const db = getDb();
  await db
    .update(appSettings)
    .set({
      siteTitle: parsed.data.siteTitle,
      siteDescription: parsed.data.siteDescription,
      updatedAt: new Date(),
    })
    .where(eq(appSettings.id, settings.id));

  revalidatePath("/admin/pengaturan");
  revalidatePath("/", "layout");

  return { ok: true };
}
