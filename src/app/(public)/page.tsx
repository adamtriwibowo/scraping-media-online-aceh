import { getArticles, getSitesWithStats, getStatsSummary } from "@/lib/queries";
import { FiltersBar } from "@/components/news/filters-bar";
import { NewsTable } from "@/components/news/news-table";
import { PaginationBar } from "@/components/pagination-bar";
import { StatRow, Stat } from "@/components/stat-row";
import { getSettings } from "@/lib/settings";
import { Newspaper, Globe2, MapPin, Tags } from "lucide-react";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1") || 1;

  const [{ rows, total }, sites, stats, settings] = await Promise.all([
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
    getSettings(),
  ]);

  const localCount = sites.filter((s) => s.category === "lokal").length;
  const nasionalCount = sites.filter((s) => s.category === "nasional").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Semua Berita</h1>
        <p className="text-sm text-muted-foreground">{settings.siteDescription}</p>
      </div>

      <StatRow>
        <Stat icon={Newspaper} label="Total berita" value={stats.totals.totalArticles} accent />
        <Stat icon={Globe2} label="Sumber aktif" value={stats.totals.totalSites} />
        <Stat icon={MapPin} label="Media lokal" value={localCount} />
        <Stat icon={Tags} label="Media nasional" value={nasionalCount} />
      </StatRow>

      <FiltersBar sites={sites.map((s) => ({ id: s.id, name: s.name, category: s.category }))} />

      <NewsTable rows={rows} />

      {total > 0 && <PaginationBar page={page} pageSize={25} total={total} />}
    </div>
  );
}
