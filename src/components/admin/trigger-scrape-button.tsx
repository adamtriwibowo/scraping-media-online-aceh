"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function TriggerScrapeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/scrape", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menjalankan scraping");
        return;
      }
      toast.success(
        `Scraping selesai: ${data.sitesProcessed} situs diproses, ${data.articlesNew} berita baru`
      );
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan saat menjalankan scraping");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="gap-2">
      <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
      {loading ? "Memproses..." : "Update Data dari Website"}
    </Button>
  );
}
