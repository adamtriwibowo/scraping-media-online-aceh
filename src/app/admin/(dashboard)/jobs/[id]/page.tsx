import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { scrapeJobs } from "@/db/schema";
import { getScrapeLogsForJob } from "@/lib/scrape-queries";
import { StatRow, Stat } from "@/components/stat-row";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const statusStyle: Record<string, string> = {
  success: "bg-good/12 text-good",
  partial: "bg-brass/15 text-brass-strong",
  error: "bg-destructive/12 text-destructive",
  running: "bg-teal/12 text-teal-strong",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = Number(id);
  const db = getDb();
  const [job] = await db.select().from(scrapeJobs).where(eq(scrapeJobs.id, jobId));
  if (!job) notFound();

  const logs = await getScrapeLogsForJob(jobId);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/admin"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke dashboard
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Detail Job #{job.id}</h1>
        <span className={cn("px-1.5 py-0.5 text-[11px] leading-none", statusStyle[job.status] ?? "bg-muted text-muted-foreground")}>
          {job.status}
        </span>
        <span className="border border-border px-1.5 py-0.5 text-[11px] leading-none text-muted-foreground">
          {job.trigger === "manual" ? "Manual" : "Terjadwal"}
        </span>
      </div>

      <StatRow>
        <Stat label="Situs diproses" value={job.sitesProcessed} accent />
        <Stat label="Berita ditemukan" value={job.articlesFound} />
        <Stat label="Berita baru" value={job.articlesNew} />
        <Stat label="Mulai" value={formatDate(job.startedAt)} />
      </StatRow>

      <div>
        <h2 className="mb-2 text-[13px] font-medium text-ink">Log per situs</h2>
        <div className="divide-y divide-border border border-border">
          {logs.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Tidak ada log untuk job ini.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-ink">{log.siteName ?? "Situs terhapus"}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] leading-none",
                    statusStyle[log.status] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {log.status}
                </span>
              </div>
              <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground tabular-figures">
                <span>{log.articlesFound} ditemukan</span>
                <span>{log.articlesNew} baru</span>
              </div>
              {log.message && <p className="text-xs text-destructive">{log.message}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
