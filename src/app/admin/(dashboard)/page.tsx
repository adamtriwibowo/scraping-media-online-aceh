import Link from "next/link";
import { getStatsSummary } from "@/lib/queries";
import { getRecentScrapeJobs } from "@/lib/scrape-queries";
import { TriggerScrapeButton } from "@/components/admin/trigger-scrape-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Globe2, Tags, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Admin" };

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  success: "default",
  partial: "secondary",
  error: "destructive",
  running: "outline",
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
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Admin</h1>
          <p className="text-sm text-muted-foreground">
            Kelola proses scraping media dan pantau status sumber berita.
          </p>
        </div>
        <TriggerScrapeButton />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Newspaper className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-semibold leading-none">
                {stats.totals.totalArticles.toLocaleString("id-ID")}
              </p>
              <p className="text-xs text-muted-foreground">Total Berita</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Globe2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-semibold leading-none">{stats.totals.totalSites}</p>
              <p className="text-xs text-muted-foreground">Sumber Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Tags className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-semibold leading-none">{stats.topKeywords.length}</p>
              <p className="text-xs text-muted-foreground">Keyword Terdeteksi</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-lg font-semibold leading-none">
                {formatDate(jobs[0]?.finishedAt ?? jobs[0]?.startedAt ?? null)}
              </p>
              <p className="text-xs text-muted-foreground">Scraping Terakhir</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Riwayat Scraping</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {jobs.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                Belum ada riwayat scraping. Klik &quot;Update Data dari Website&quot; untuk memulai.
              </p>
            )}
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/admin/jobs/${job.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[job.status] ?? "outline"}>{job.status}</Badge>
                  <span className="text-muted-foreground">
                    {job.trigger === "manual" ? "Manual" : "Terjadwal"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{job.sitesProcessed} situs</span>
                  <span>{job.articlesNew} berita baru</span>
                  <span>{formatDate(job.startedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
