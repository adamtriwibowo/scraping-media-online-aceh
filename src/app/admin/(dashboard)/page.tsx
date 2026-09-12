import Link from "next/link";
import { getStatsSummary } from "@/lib/queries";
import { getRecentScrapeJobs } from "@/lib/scrape-queries";
import { TriggerScrapeButton } from "@/components/admin/trigger-scrape-button";
import { StatRow, Stat } from "@/components/stat-row";
import { Newspaper, Globe2, Tags, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Admin" };

const statusStyle: Record<string, string> = {
  success: "bg-good/12 text-good",
  partial: "bg-brass/15 text-brass-strong",
  error: "bg-destructive/12 text-destructive",
  running: "bg-teal/12 text-teal-strong",
};

function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminDashboardPage() {
  const [stats, jobs] = await Promise.all([getStatsSummary(), getRecentScrapeJobs(15)]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">
            Kelola proses scraping media dan pantau status sumber berita.
          </p>
        </div>
        <TriggerScrapeButton />
      </div>

      <StatRow>
        <Stat icon={Newspaper} label="Total berita" value={stats.totals.totalArticles} accent />
        <Stat icon={Globe2} label="Sumber aktif" value={stats.totals.totalSites} />
        <Stat icon={Tags} label="Keyword terdeteksi" value={stats.topKeywords.length} />
        <Stat
          icon={Clock}
          label="Scraping terakhir"
          value={formatDate(jobs[0]?.finishedAt ?? jobs[0]?.startedAt ?? null)}
        />
      </StatRow>

      <div>
        <h2 className="mb-2 text-[13px] font-medium text-ink">Riwayat scraping</h2>
        <div className="divide-y divide-border border border-border">
          {jobs.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              Belum ada riwayat scraping. Klik &quot;Update Data dari Website&quot; untuk memulai.
            </p>
          )}
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/admin/jobs/${job.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-accent/40"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[11px] leading-none",
                    statusStyle[job.status] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {job.status}
                </span>
                <span className="text-muted-foreground">
                  {job.trigger === "manual" ? "Manual" : "Terjadwal"}
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground tabular-figures">
                <span>{job.sitesProcessed} situs</span>
                <span>{job.articlesNew} berita baru</span>
                <span>{formatDate(job.startedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
