import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  varchar,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const siteCategoryEnum = pgEnum("site_category", ["lokal", "nasional"]);
export const scrapeStatusEnum = pgEnum("scrape_status", [
  "running",
  "success",
  "partial",
  "error",
]);
export const scrapeTriggerEnum = pgEnum("scrape_trigger", ["cron", "manual"]);

export const sites = pgTable(
  "sites",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    url: text("url").notNull(),
    rssUrl: text("rss_url"),
    category: siteCategoryEnum("category").notNull().default("lokal"),
    active: boolean("active").notNull().default(true),
    articleCount: integer("article_count").notNull().default(0),
    lastScrapedAt: timestamp("last_scraped_at", { withTimezone: true }),
    lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    urlUnique: uniqueIndex("sites_url_unique").on(table.url),
  })
);

export const sitesRelations = relations(sites, ({ many }) => ({
  articles: many(articles),
  scrapeLogs: many(scrapeLogs),
}));

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    siteId: integer("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    url: text("url").notNull(),
    snippet: text("snippet"),
    imageUrl: text("image_url"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    scrapedAt: timestamp("scraped_at", { withTimezone: true }).notNull().defaultNow(),
    matchedKeywords: text("matched_keywords").array().notNull().default([]),
  },
  (table) => ({
    urlUnique: uniqueIndex("articles_url_unique").on(table.url),
  })
);

export const articlesRelations = relations(articles, ({ one }) => ({
  site: one(sites, { fields: [articles.siteId], references: [sites.id] }),
}));

export const keywords = pgTable(
  "keywords",
  {
    id: serial("id").primaryKey(),
    word: varchar("word", { length: 150 }).notNull(),
    label: varchar("label", { length: 150 }),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    wordUnique: uniqueIndex("keywords_word_unique").on(table.word),
  })
);

export const scrapeJobs = pgTable("scrape_jobs", {
  id: serial("id").primaryKey(),
  trigger: scrapeTriggerEnum("trigger").notNull().default("manual"),
  status: scrapeStatusEnum("status").notNull().default("running"),
  sitesProcessed: integer("sites_processed").notNull().default(0),
  articlesFound: integer("articles_found").notNull().default(0),
  articlesNew: integer("articles_new").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const scrapeJobsRelations = relations(scrapeJobs, ({ many }) => ({
  logs: many(scrapeLogs),
}));

export const scrapeLogs = pgTable("scrape_logs", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .notNull()
    .references(() => scrapeJobs.id, { onDelete: "cascade" }),
  siteId: integer("site_id").references(() => sites.id, { onDelete: "set null" }),
  status: scrapeStatusEnum("status").notNull(),
  articlesFound: integer("articles_found").notNull().default(0),
  articlesNew: integer("articles_new").notNull().default(0),
  message: text("message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const scrapeLogsRelations = relations(scrapeLogs, ({ one }) => ({
  job: one(scrapeJobs, { fields: [scrapeLogs.jobId], references: [scrapeJobs.id] }),
  site: one(sites, { fields: [scrapeLogs.siteId], references: [sites.id] }),
}));

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Keyword = typeof keywords.$inferSelect;
export type NewKeyword = typeof keywords.$inferInsert;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type ScrapeLog = typeof scrapeLogs.$inferSelect;
