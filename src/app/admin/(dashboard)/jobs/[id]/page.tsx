import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { scrapeJobs } from "@/db/schema";
import { getScrapeLogsForJob } from "@/lib/scrape-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

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
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Dashboard
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Detail Job #{job.id}</h1>
        <Badge>{job.status}</Badge>
        <Badge variant="outline">{job.trigger === "manual" ? "Manual" : "Terjadwal"}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBlock label="Situs Diproses" value={job.sitesProcessed} />
        <StatBlock label="Berita Ditemukan" value={job.articlesFound} />
        <StatBlock label="Berita Baru" value={job.articlesNew} />
        <StatBlock label="Mulai" value={formatDate(job.startedAt)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log per Situs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {logs.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">Tidak ada log untuk job ini.</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-1 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{log.siteName ?? "Situs terhapus"}</span>
                  <Badge
                    variant={
                      log.status === "success"
                        ? "default"
                        : log.status === "error"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-[10px]"
                  >
                    {log.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{log.articlesFound} ditemukan</span>
                  <span>{log.articlesNew} baru</span>
                </div>
                {log.message && <p className="text-xs text-destructive">{log.message}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-lg font-semibold leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
