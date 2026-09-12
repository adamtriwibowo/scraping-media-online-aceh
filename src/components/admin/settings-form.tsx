"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  updateCredentials,
  updateScrapeSettings,
  updateSiteInfo,
} from "@/app/admin/(dashboard)/pengaturan/actions";
import type { AppSettings } from "@/db/schema";

function CredentialsSection({ currentUsername }: { currentUsername: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateCredentials(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Kredensial admin berhasil diperbarui");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 border border-border p-4">
      <div>
        <h2 className="text-[13px] font-medium text-ink">Kredensial admin</h2>
        <p className="text-xs text-muted-foreground">
          Ganti username atau password untuk masuk ke panel admin ini.
        </p>
      </div>
      <form action={handleSubmit} className="flex max-w-md flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currentPassword">Password saat ini</Label>
          <Input id="currentPassword" name="currentPassword" type="password" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newUsername">Username</Label>
          <Input id="newUsername" name="newUsername" defaultValue={currentUsername} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">Password baru</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="Kosongkan jika tidak ingin mengganti"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Konfirmasi password baru</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" />
        </div>
        <Button type="submit" disabled={loading} className="mt-1 w-fit gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Menyimpan..." : "Simpan kredensial"}
        </Button>
      </form>
    </section>
  );
}

function ScrapeSection({ concurrency, timeoutMs }: { concurrency: number; timeoutMs: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateScrapeSettings(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pengaturan scraping berhasil diperbarui");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 border border-border p-4">
      <div>
        <h2 className="text-[13px] font-medium text-ink">Pengaturan scraping</h2>
        <p className="text-xs text-muted-foreground">
          Berapa banyak situs diproses bersamaan, dan berapa lama sistem menunggu respons tiap situs
          sebelum dianggap gagal.
        </p>
      </div>
      <form action={handleSubmit} className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scrapeConcurrency">Situs bersamaan</Label>
          <Input
            id="scrapeConcurrency"
            name="scrapeConcurrency"
            type="number"
            min={1}
            max={20}
            defaultValue={concurrency}
            className="w-32"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="scrapeTimeoutSeconds">Timeout per situs (detik)</Label>
          <Input
            id="scrapeTimeoutSeconds"
            name="scrapeTimeoutSeconds"
            type="number"
            min={3}
            max={60}
            defaultValue={Math.round(timeoutMs / 1000)}
            className="w-40"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </section>
  );
}

function SiteInfoSection({ title, description }: { title: string; description: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = await updateSiteInfo(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Info situs berhasil diperbarui");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3 border border-border p-4">
      <div>
        <h2 className="text-[13px] font-medium text-ink">Info situs publik</h2>
        <p className="text-xs text-muted-foreground">
          Nama dan tagline yang tampil di header, footer, dan judul tab browser halaman publik.
        </p>
      </div>
      <form action={handleSubmit} className="flex max-w-md flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="siteTitle">Nama situs</Label>
          <Input id="siteTitle" name="siteTitle" defaultValue={title} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="siteDescription">Tagline / deskripsi</Label>
          <Textarea id="siteDescription" name="siteDescription" defaultValue={description} rows={3} required />
        </div>
        <Button type="submit" disabled={loading} className="w-fit gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </form>
    </section>
  );
}

export function SettingsForm({ settings }: { settings: AppSettings }) {
  return (
    <div className="flex flex-col gap-6">
      <CredentialsSection currentUsername={settings.adminUsername} />
      <ScrapeSection concurrency={settings.scrapeConcurrency} timeoutMs={settings.scrapeTimeoutMs} />
      <SiteInfoSection title={settings.siteTitle} description={settings.siteDescription} />
    </div>
  );
}
