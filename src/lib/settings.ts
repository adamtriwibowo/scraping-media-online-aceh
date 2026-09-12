import { cache } from "react";
import { getDb } from "@/db";
import { appSettings } from "@/db/schema";

/**
 * Reads the singleton app_settings row, creating it on first use from the
 * ADMIN_USERNAME / ADMIN_PASSWORD_HASH env vars so an existing deployment's
 * admin login keeps working the moment this table is introduced. After that
 * first read, the env vars are no longer consulted — the database row is
 * authoritative and editable from /admin/pengaturan.
 *
 * Wrapped in React's cache() so the root layout's metadata, the public
 * layout's nav/footer, and a page's own body all share one DB round-trip
 * per request instead of three.
 */
export const getSettings = cache(async function getSettings() {
  const db = getDb();

  const [existing] = await db.select().from(appSettings).limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(appSettings)
    .values({
      id: 1,
      adminUsername: process.env.ADMIN_USERNAME ?? "admin",
      adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? "",
    })
    .onConflictDoNothing({ target: appSettings.id })
    .returning();
  if (created) return created;

  // Another concurrent request won the race to create row 1 — read it back.
  const [row] = await db.select().from(appSettings).limit(1);
  return row;
});
