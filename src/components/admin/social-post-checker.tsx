"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialEmbed } from "@/components/social/social-embed";
import { createSocialPost } from "@/app/admin/(dashboard)/media-sosial/actions";
import { CheckCircle2, XCircle, Loader2, Search, AtSign } from "lucide-react";
import type { SocialPlatform } from "@/lib/scraper/check-social";

type SocialPostCheckResult = {
  ok: boolean;
  platform: SocialPlatform | null;
  postUrl: string;
  embedHtml: string | null;
  authorName: string | null;
  authorUrl: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  error: string | null;
};

const CATEGORY_OPTIONS = ["Berita", "Budaya", "Wisata", "Edukasi", "Hiburan"];
const PLATFORM_LABEL: Record<SocialPlatform, string> = { tiktok: "TikTok", x: "X (Twitter)" };

export function SocialPostChecker() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<SocialPostCheckResult | null>(null);

  const [category, setCategory] = useState("Berita");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setChecking(true);
    setResult(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/check-social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal memeriksa URL");
        return;
      }
      setResult(data);
      if (data.ok) setCategory("Berita");
    } catch {
      toast.error("Terjadi kesalahan saat memeriksa URL");
    } finally {
      setChecking(false);
    }
  }

  async function handleAddToDatabase() {
    if (!result?.ok || !result.platform || !result.embedHtml) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("platform", result.platform);
      formData.set("postUrl", result.postUrl);
      formData.set("embedHtml", result.embedHtml);
      formData.set("authorName", result.authorName ?? "");
      formData.set("authorUrl", result.authorUrl ?? "");
      formData.set("caption", result.caption ?? "");
      formData.set("thumbnailUrl", result.thumbnailUrl ?? "");
      formData.set("category", category);
      formData.set("active", "on");

      const res = await createSocialPost(formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Post ditambahkan ke database.");
      setSaved(true);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCheck} className="flex flex-col gap-2 border border-border p-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="social-url">URL post TikTok atau X</Label>
          <Input
            id="social-url"
            placeholder="https://www.tiktok.com/@akun/video/... atau https://x.com/akun/status/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={checking} className="gap-2 sm:mb-0">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {checking ? "Memeriksa..." : "Cek Post"}
        </Button>
      </form>

      {result && !result.ok && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-ink">Post tidak valid</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{result.error}</p>
          </div>
        </div>
      )}

      {result?.ok && result.platform && result.embedHtml && (
        <div className="flex flex-col gap-4 border border-good/30 bg-good/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-good" />
            <div>
              <p className="text-sm font-medium text-ink">
                Post valid — {PLATFORM_LABEL[result.platform]}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {result.authorName ? `Akun: ${result.authorName}` : "Terdeteksi via oEmbed"}
              </p>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto border-t border-good/20 pt-3">
            <SocialEmbed platform={result.platform} html={result.embedHtml} className="mx-auto max-w-[550px]" />
          </div>

          <div className="flex flex-col gap-3 border-t border-good/20 pt-3">
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <AtSign className="h-3.5 w-3.5 text-brass" />
              Rekomendasi: tambahkan post ini ke database
            </div>

            {saved ? (
              <p className="text-sm text-good">Post ini sudah tersimpan di database.</p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="detected-category">Kategori</Label>
                  <Input
                    id="detected-category"
                    list="social-category-options-checker"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="sm:w-40"
                    required
                  />
                  <datalist id="social-category-options-checker">
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <Button onClick={handleAddToDatabase} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? "Menyimpan..." : "Tambahkan ke Database"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
