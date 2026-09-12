import { getArticles, getSitesWithStats, getStatsSummary } from "@/lib/queries";
import { FiltersBar } from "@/components/news/filters-bar";
import { NewsTable } from "@/components/news/news-table";
import { PaginationBar } from "@/components/pagination-bar";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, Globe2, MapPin, Tags } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [{ rows, total }, sites, stats] = await Promise.all([
    getArticles({
      siteId: params.siteId,
      category: params.category,
      keyword: params.keyword,
      from: params.from,
      to: params.to,
      search: params.search,
      page,
      pageSize: 25,
    }),
    getSitesWithStats(),
    getStatsSummary(),
  ]);

  const localCount = sites.filter((s) => s.category === "lokal").length;
  const nasionalCount = sites.filter((s) => s.category === "nasional").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Semua Berita</h1>
        <p className="text-sm text-muted-foreground">
          Agregasi berita real-time dari media lokal Aceh dan nasional.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Newspaper} label="Total Berita" value={stats.totals.totalArticles} />
        <StatCard icon={Globe2} label="Sumber Aktif" value={stats.totals.totalSites} />
        <StatCard icon={MapPin} label="Media Lokal" value={localCount} />
        <StatCard icon={Tags} label="Media Nasional" value={nasionalCount} />
      </div>

      <FiltersBar sites={sites.map((s) => ({ id: s.id, name: s.name, category: s.category }))} />

      <NewsTable rows={rows} />

      {total > 0 && <PaginationBar page={page} pageSize={25} total={total} />}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none">{value.toLocaleString("id-ID")}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
