"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRadioStation } from "@/app/admin/(dashboard)/radio/actions";
import { CheckCircle2, XCircle, Loader2, Search, Play, Square, Radio } from "lucide-react";

type StreamCheckResult = {
  ok: boolean;
  streamUrl: string;
  contentType: string | null;
  detectedName: string | null;
  detectedGenre: string | null;
  bitrateKbps: number | null;
  error: string | null;
};

function guessName(streamUrl: string) {
  try {
    return new URL(streamUrl).hostname.replace(/^www\./, "");
  } catch {
    return streamUrl;
  }
}

export function StreamChecker() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<StreamCheckResult | null>(null);
  const [playing, setPlaying] = useState(false);

  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("Banda Aceh");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setChecking(true);
    setResult(null);
    setSaved(false);
    stopPreview();
    try {
      const res = await fetch("/api/admin/check-stream", {
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
        setName(data.detectedName || guessName(data.streamUrl));
        setGenre(data.detectedGenre || "");
        setFrequency("");
        setCity("Banda Aceh");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memeriksa URL");
    } finally {
      setChecking(false);
    }
  }

  function togglePreview() {
    if (!result?.ok) return;
    if (playing) {
      stopPreview();
      return;
    }
    if (audioRef.current) {
      audioRef.current.src = result.streamUrl;
      // Real success/failure is decided by the onPlaying/onError handlers on
      // the <audio> element below — many icecast streams reject this promise
      // with a transient AbortError while buffering, then play fine seconds
      // later, so treating the rejection itself as failure is a false alarm.
      audioRef.current.play().catch(() => {});
    }
  }

  function stopPreview() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }
    setPlaying(false);
  }

  async function handleAddToDatabase() {
    if (!result?.ok) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("frequency", frequency);
      formData.set("streamUrl", result.streamUrl);
      formData.set("genre", genre);
      formData.set("city", city);
      formData.set("active", "on");

      const res = await createRadioStation(formData);
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
      <audio
        ref={audioRef}
        onPlaying={() => setPlaying(true)}
        onError={() => {
          setPlaying(false);
          toast.error("Gagal memutar stream ini di browser.");
        }}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />

      <form onSubmit={handleCheck} className="flex flex-col gap-2 border border-border p-4 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor="stream-url">URL stream radio</Label>
          <Input
            id="stream-url"
            placeholder="https://stream.contoh.com/live atau .pls/.m3u"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={checking} className="gap-2 sm:mb-0">
          {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {checking ? "Memeriksa..." : "Cek Stream"}
        </Button>
      </form>

      {result && !result.ok && (
        <div className="flex items-start gap-3 border border-destructive/30 bg-destructive/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-ink">Stream tidak valid</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{result.error}</p>
          </div>
        </div>
      )}

      {result?.ok && (
        <div className="flex flex-col gap-4 border border-good/30 bg-good/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-good" />
              <div>
                <p className="text-sm font-medium text-ink">Stream valid</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground tabular-figures">
                  {result.contentType ?? "audio"}
                  {result.bitrateKbps ? ` · ${result.bitrateKbps} kbps` : ""}
                </p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={togglePreview} className="gap-1.5">
              {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Stop" : "Coba dengarkan"}
            </Button>
          </div>

          <div className="flex flex-col gap-3 border-t border-good/20 pt-3">
            <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <Radio className="h-3.5 w-3.5 text-brass" />
              Rekomendasi: tambahkan radio ini ke database
            </div>

            {saved ? (
              <p className="text-sm text-good">Radio ini sudah tersimpan di database.</p>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="detected-name">Nama radio</Label>
                    <Input id="detected-name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="detected-frequency">Frekuensi</Label>
                    <Input
                      id="detected-frequency"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="101.5 FM"
                      className="sm:w-36"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label htmlFor="detected-genre">Genre</Label>
                    <Input id="detected-genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="detected-city">Kota</Label>
                    <Input
                      id="detected-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="sm:w-40"
                      required
                    />
                  </div>
                  <Button onClick={handleAddToDatabase} disabled={saving || !name.trim()} className="gap-2">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {saving ? "Menyimpan..." : "Tambahkan ke Database"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
