"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createVideo } from "@/app/admin/(dashboard)/video/actions";
import { CheckCircle2, XCircle, Loader2, Search, Clapperboard } from "lucide-react";

type VideoCheckResult = {
  ok: boolean;
  youtubeUrl: string;
  youtubeId: string | null;
  title: string | null;
  channelName: string | null;
  thumbnailUrl: string | null;
  error: string | null;
};

const CATEGORY_OPTIONS = ["Berita", "Budaya", "Wisata", "Edukasi", "Hiburan"];

export function VideoChecker() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<VideoCheckResult | null>(null);

  const [title, setTitle] = useState("");
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
      const res = await fetch("/api/admin/check-video", {
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
      if (data.ok) {
        setTitle(data.title || "");
        setCategory("Berita");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memeriksa URL");
    } finally {
      setChecking(false);
    }
  }

  async function handleAddToDatabase() {
    if (!result?.ok) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("youtubeUrl", result.youtubeUrl);
      formData.set("thumbnailUrl", result.thumbnailUrl ?? "");
      formData.set("channelName", result.channelName ?? "");
      formData.set("category", category);
      formData.set("active", "on");

      const res = await createVideo(formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${title}" ditambahkan ke database.`);
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
          <Label htmlFor="video-url">URL video YouTube</Label>
          <Input
            id="video-url"
            placeholder="https://www.youtube.com/watch?v=... atau youtu.be/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={checking} className="gap-2 sm:mb-0">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {checking ? "Memeriksa..." : "Cek Video"}
        </Button>
      </form>

      {result && !result.ok && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-ink">Video tidak valid</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{result.error}</p>
          </div>
        </div>
      )}

      {result?.ok && (
        <div className="flex flex-col gap-4 border border-good/30 bg-good/5 p-4 sm:flex-row">
          {result.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={result.thumbnailUrl}
              alt=""
              className="h-[108px] w-[192px] shrink-0 border border-good/30 object-cover"
            />
          )}
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-good" />
              <div>
                <p className="text-sm font-medium text-ink">Video valid</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {result.channelName ? `Channel: ${result.channelName}` : "Terdeteksi via YouTube oEmbed"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-good/20 pt-3">
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                <Clapperboard className="h-3.5 w-3.5 text-brass" />
                Rekomendasi: tambahkan video ini ke database
              </div>

              {saved ? (
                <p className="text-sm text-good">Video ini sudah tersimpan di database.</p>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="detected-title">Judul</Label>
                    <Input id="detected-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="detected-category">Kategori</Label>
                    <Input
                      id="detected-category"
                      list="video-category-options-checker"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="sm:w-40"
                      required
                    />
                    <datalist id="video-category-options-checker">
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <Button onClick={handleAddToDatabase} disabled={saving || !title.trim()} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {saving ? "Menyimpan..." : "Tambahkan ke Database"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
