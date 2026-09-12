import { getStatsSummary, type StatsGranularity } from "@/lib/queries";
import {
  TopSitesChart,
  TrendChart,
  CategoryChart,
  KeywordsChart,
} from "@/components/stats/stats-charts";
import { StatsFilterBar } from "@/components/stats/stats-filter-bar";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statistik" };

const GRANULARITIES: StatsGranularity[] = ["day", "month", "year"];

export default async function StatistikPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const granularity = GRANULARITIES.includes(params.granularity as StatsGranularity)
    ? (params.granularity as StatsGranularity)
    : "day";

  const stats = await getStatsSummary({ from: params.from, to: params.to, granularity });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Statistik</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan visual dari {stats.totals.totalArticles.toLocaleString("id-ID")} berita yang
          terkumpul dari {stats.totals.totalSites} sumber
          {(params.from || params.to) && " pada periode yang dipilih"}.
        </p>
      </div>

      <StatsFilterBar />

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart data={stats.trend} granularity={stats.granularity} />
        <CategoryChart data={stats.byCategory} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopSitesChart data={stats.bySite} />
        <KeywordsChart data={stats.topKeywords} />
      </div>
    </div>
  );
}
