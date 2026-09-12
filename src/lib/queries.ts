import { and, asc, desc, eq, gte, ilike, lte, sql, SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { articles, radioStations, sites, videos } from "@/db/schema";

export type ArticleFilters = {
  siteId?: string;
  category?: string;
  keyword?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type ArticleRow = {
  id: number;
  title: string;
  url: string;
  snippet: string | null;
  imageUrl: string | null;
  publishedAt: Date | null;
  scrapedAt: Date;
  matchedKeywords: string[];
  siteId: number;
  siteName: string;
  siteCategory: string;
};

function buildConditions(filters: ArticleFilters): SQL[] {
  const conditions: SQL[] = [];
  const dateExpr = sql`coalesce(${articles.publishedAt}, ${articles.scrapedAt})`;

  if (filters.siteId) {
    conditions.push(eq(articles.siteId, Number(filters.siteId)));
  }
  if (filters.category) {
    conditions.push(eq(sites.category, filters.category as "lokal" | "nasional"));
  }
  if (filters.keyword) {
    conditions.push(sql`${filters.keyword} = ANY(${articles.matchedKeywords})`);
  }
  if (filters.from) {
    conditions.push(gte(dateExpr, new Date(filters.from)));
  }
  if (filters.to) {
    const to = new Date(filters.to);
    to.setHours(23, 59, 59, 999);
    conditions.push(lte(dateExpr, to));
  }
  if (filters.search) {
    conditions.push(ilike(articles.title, `%${filters.search}%`));
  }

  return conditions;
}

export async function getArticles(filters: ArticleFilters) {
  const db = getDb();
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 25;
  const conditions = buildConditions(filters);
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const baseQuery = db
    .select({
      id: articles.id,
      title: articles.title,
      url: articles.url,
      snippet: articles.snippet,
      imageUrl: articles.imageUrl,
      publishedAt: articles.publishedAt,
      scrapedAt: articles.scrapedAt,
      matchedKeywords: articles.matchedKeywords,
      siteId: articles.siteId,
      siteName: sites.name,
      siteCategory: sites.category,
    })
    .from(articles)
    .innerJoin(sites, eq(articles.siteId, sites.id))
    .where(whereClause)
    .orderBy(desc(sql`coalesce(${articles.publishedAt}, ${articles.scrapedAt})`))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  const countQuery = db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .innerJoin(sites, eq(articles.siteId, sites.id))
    .where(whereClause);

  const [rows, countResult] = await Promise.all([baseQuery, countQuery]);

  return {
    rows: rows as ArticleRow[],
    total: countResult[0]?.count ?? 0,
    page,
    pageSize,
  };
}

export async function getSitesWithStats() {
  const db = getDb();
  return db.select().from(sites).orderBy(desc(sites.articleCount));
}

export async function getRadioStations({ activeOnly = false }: { activeOnly?: boolean } = {}) {
  const db = getDb();
  return db
    .select()
    .from(radioStations)
    .where(activeOnly ? eq(radioStations.active, true) : undefined)
    .orderBy(asc(radioStations.name));
}

export async function getVideos({
  activeOnly = false,
  category,
}: { activeOnly?: boolean; category?: string } = {}) {
  const db = getDb();
  const conditions: SQL[] = [];
  if (activeOnly) conditions.push(eq(videos.active, true));
  if (category) conditions.push(eq(videos.category, category));

  return db
    .select()
    .from(videos)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(videos.createdAt));
}

export async function getVideoCategories() {
  const db = getDb();
  const rows = await db
    .selectDistinct({ category: videos.category })
    .from(videos)
    .where(eq(videos.active, true))
    .orderBy(asc(videos.category));
  return rows.map((r) => r.category);
}

export type StatsGranularity = "day" | "month" | "year";

export type StatsFilters = {
  from?: string;
  to?: string;
  granularity?: StatsGranularity;
};

const PERIOD_FORMAT: Record<StatsGranularity, string> = {
  day: "YYYY-MM-DD",
  month: "YYYY-MM",
  year: "YYYY",
};

const DEFAULT_TREND_WINDOW: Record<StatsGranularity, SQL> = {
  day: sql`now() - interval '30 days'`,
  month: sql`now() - interval '12 months'`,
  year: sql`now() - interval '5 years'`,
};

export async function getStatsSummary(filters: StatsFilters = {}) {
  const db = getDb();
  const dateExpr = sql`coalesce(${articles.publishedAt}, ${articles.scrapedAt})`;
  const granularity = filters.granularity ?? "day";

  const dateConditions: SQL[] = [];
  if (filters.from) {
    dateConditions.push(gte(dateExpr, new Date(filters.from)));
  }
  if (filters.to) {
    const to = new Date(filters.to);
    to.setHours(23, 59, 59, 999);
    dateConditions.push(lte(dateExpr, to));
  }
  const dateWhere = dateConditions.length > 0 ? and(...dateConditions) : undefined;

  // The trend chart needs a bounded window even with no explicit filter —
  // otherwise it groups the entire history into one bar per period.
  const trendWhere = dateWhere ?? gte(dateExpr, DEFAULT_TREND_WINDOW[granularity]);
  // sql.raw (not a bound parameter) so every reference to periodExpr below
  // — in SELECT, GROUP BY, and ORDER BY — produces byte-identical SQL text;
  // Postgres requires the GROUP BY expression to structurally match the
  // SELECT one, which three separate parameter placeholders (even bound to
  // the same value) do not satisfy. The format is one of PERIOD_FORMAT's
  // fixed literals, never user input, so inlining it is safe.
  const periodExpr = sql<string>`to_char(${dateExpr}, ${sql.raw(`'${PERIOD_FORMAT[granularity]}'`)})`;

  // Each of these is an independent round-trip to Neon over HTTP — running
  // them concurrently instead of one-by-one turns 5x network latency into 1x.
  const [[totals], byCategory, bySite, trend, topKeywords] = await Promise.all([
    db
      .select({
        totalArticles: sql<number>`count(*)::int`,
        totalSites: sql<number>`count(distinct ${articles.siteId})::int`,
      })
      .from(articles)
      .where(dateWhere),
    db
      .select({
        category: sites.category,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .innerJoin(sites, eq(articles.siteId, sites.id))
      .where(dateWhere)
      .groupBy(sites.category),
    db
      .select({
        siteName: sites.name,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .innerJoin(sites, eq(articles.siteId, sites.id))
      .where(dateWhere)
      .groupBy(sites.name)
      .orderBy(desc(sql`count(*)`))
      .limit(15),
    db
      .select({
        period: periodExpr,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .where(trendWhere)
      .groupBy(periodExpr)
      .orderBy(periodExpr),
    db
      .select({
        keyword: sql<string>`unnest(${articles.matchedKeywords})`,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .where(dateWhere)
      .groupBy(sql`unnest(${articles.matchedKeywords})`)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
  ]);

  return { totals, byCategory, bySite, trend, topKeywords, granularity };
}
