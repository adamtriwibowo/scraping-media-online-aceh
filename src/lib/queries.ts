import { and, desc, eq, gte, ilike, lte, sql, SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { articles, sites } from "@/db/schema";

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

export async function getStatsSummary() {
  const db = getDb();

  // Each of these is an independent round-trip to Neon over HTTP — running
  // them concurrently instead of one-by-one turns 5x network latency into 1x.
  const [[totals], byCategory, bySite, byDay, topKeywords] = await Promise.all([
    db
      .select({
        totalArticles: sql<number>`count(*)::int`,
        totalSites: sql<number>`count(distinct ${articles.siteId})::int`,
      })
      .from(articles),
    db
      .select({
        category: sites.category,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .innerJoin(sites, eq(articles.siteId, sites.id))
      .groupBy(sites.category),
    db
      .select({
        siteName: sites.name,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .innerJoin(sites, eq(articles.siteId, sites.id))
      .groupBy(sites.name)
      .orderBy(desc(sql`count(*)`))
      .limit(15),
    db
      .select({
        day: sql<string>`to_char(coalesce(${articles.publishedAt}, ${articles.scrapedAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .where(sql`coalesce(${articles.publishedAt}, ${articles.scrapedAt}) > now() - interval '30 days'`)
      .groupBy(sql`to_char(coalesce(${articles.publishedAt}, ${articles.scrapedAt}), 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(coalesce(${articles.publishedAt}, ${articles.scrapedAt}), 'YYYY-MM-DD')`),
    db
      .select({
        keyword: sql<string>`unnest(${articles.matchedKeywords})`,
        count: sql<number>`count(*)::int`,
      })
      .from(articles)
      .groupBy(sql`unnest(${articles.matchedKeywords})`)
      .orderBy(desc(sql`count(*)`))
      .limit(10),
  ]);

  return { totals, byCategory, bySite, byDay, topKeywords };
}
