"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSite } from "@/app/admin/(dashboard)/websites/actions";
import { CheckCircle2, XCircle, Loader2, Search, ExternalLink, Rss } from "lucide-react";

type FeedCheckResult = {
  ok: boolean;
  method: "rss" | "html" | null;
  siteUrl: string;
  feedUrl: string | null;
  itemCount: number;
  sample: { title: string; url: string }[];
  detectedName: string | null;
  error: string | null;
};

function guessName(siteUrl: string) {
  try {
    return new URL(siteUrl).hostname.replace(/^www\./, "");
  } catch {
    return siteUrl;
  }
}

export function FeedChecker() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<FeedCheckResult | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("lokal");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setChecking(true);
    setResult(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/check-feed", {
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
        setName(data.detectedName || guessName(data.siteUrl));
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
      formData.set("name", name);
      formData.set("url", result.siteUrl);
      formData.set("rssUrl", result.feedUrl ?? "");
      formData.set("category", category);
      formData.set("active", "on");

      const res = await createSite(formData);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(`"${name}" ditambahkan ke database.`);
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
          <Label htmlFor="feed-url">URL website atau RSS feed</Label>
          <Input
            id="feed-url"
            placeholder="https://contoh.com atau https://contoh.com/feed/"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={checking} className="gap-2 sm:mb-0">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {checking ? "Memeriksa..." : "Cek Feed"}
        </Button>
      </form>

      {result && !result.ok && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-ink">Feed tidak ditemukan</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{result.error}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Anda tetap bisa menambahkan situs ini secara manual lewat &quot;Tambah Website&quot; di halaman
              Kelola Website.
            </p>
          </div>
        </div>
      )}

      {result?.ok && (
        <div className="flex flex-col gap-4 border border-good/30 bg-good/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-good" />
            <div>
              <p className="text-sm font-medium text-ink">
                Feed valid — {result.method === "rss" ? "terdeteksi via RSS" : "terdeteksi dari halaman utama"}
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-figures">
                {result.itemCount} artikel ditemukan
                {result.feedUrl && <> · {result.feedUrl}</>}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-t border-good/20 pt-3">
            <p className="text-[13px] font-medium text-ink">Contoh judul terbaru</p>
            <ul className="flex flex-col gap-1">
              {result.sample.map((item) => (
                <li key={item.url}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-ink hover:text-brass"
                  >
                    <span className="line-clamp-1">{item.title}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 border-t border-good/20 pt-3">
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <Rss className="h-3.5 w-3.5 text-brass" />
              Rekomendasi: tambahkan sumber ini ke database
            </div>

            {saved ? (
              <p className="text-sm text-good">Sumber ini sudah tersimpan di database.</p>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="detected-name">Nama media</Label>
                  <Input id="detected-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="detected-category">Kategori</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="detected-category" className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lokal">Lokal (Aceh)</SelectItem>
                      <SelectItem value="nasional">Nasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddToDatabase} disabled={saving || !name.trim()} className="gap-2">
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
