import { getStatsSummary } from "@/lib/queries";
import {
  TopSitesChart,
  TrendChart,
  CategoryChart,
  KeywordsChart,
} from "@/components/stats/stats-charts";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statistik" };

export default async function StatistikPage() {
  const stats = await getStatsSummary();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Statistik</h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan visual dari {stats.totals.totalArticles.toLocaleString("id-ID")} berita yang
          terkumpul dari {stats.totals.totalSites} sumber.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart data={stats.byDay} />
        <CategoryChart data={stats.byCategory} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TopSitesChart data={stats.bySite} />
        <KeywordsChart data={stats.topKeywords} />
      </div>
    </div>
  );
}
