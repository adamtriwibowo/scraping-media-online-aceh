import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  const settings = await getSettings();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Pengaturan</h1>
        <p className="text-sm text-muted-foreground">
          Kredensial admin, perilaku scraping, dan info situs publik.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
