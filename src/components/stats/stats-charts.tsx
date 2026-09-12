"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SiteCount = { siteName: string; count: number };
type DayCount = { day: string; count: number };
type CategoryCount = { category: string; count: number };
type KeywordCount = { keyword: string; count: number };

const tooltipStyle = {
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 12,
  padding: "6px 10px",
};

export function TopSitesChart({ data }: { data: SiteCount[] }) {
  const sorted = [...data].sort((a, b) => a.count - b.count).slice(-15);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 15 Sumber Berita</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="siteName"
              width={140}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="count" name="Berita" fill="var(--chart-1)" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function TrendChart({ data }: { data: DayCount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tren 30 Hari Terakhir</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ left: 8, right: 16, top: 8 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              tickFormatter={(v: string) => v.slice(5)}
              minTickGap={20}
            />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area
              type="monotone"
              dataKey="count"
              name="Berita"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="url(#trendFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function CategoryChart({ data }: { data: CategoryCount[] }) {
  const colors: Record<string, string> = {
    lokal: "var(--chart-1)",
    nasional: "var(--chart-2)",
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Berita per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
            <YAxis
              type="category"
              dataKey="category"
              width={80}
              tick={{ fontSize: 12, fill: "var(--foreground)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="count" name="Berita" radius={[0, 4, 4, 0]} barSize={28}>
              {data.map((entry) => (
                <Cell key={entry.category} fill={colors[entry.category] ?? "var(--chart-3)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          {data.map((d) => (
            <span key={d.category} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colors[d.category] ?? "var(--chart-3)" }}
              />
              {d.category} ({d.count.toLocaleString("id-ID")})
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function KeywordsChart({ data }: { data: KeywordCount[] }) {
  const sorted = [...data].sort((a, b) => a.count - b.count);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top Keyword Terdeteksi</CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada berita yang cocok dengan keyword.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="keyword"
                width={110}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" name="Berita" fill="var(--chart-3)" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
