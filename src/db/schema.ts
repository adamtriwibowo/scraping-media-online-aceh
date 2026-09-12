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
export const socialPlatformEnum = pgEnum("social_platform", ["tiktok", "x"]);
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

// Singleton row (id is always 1) holding admin-editable app configuration.
// Bootstrapped on first read from ADMIN_USERNAME / ADMIN_PASSWORD_HASH env
// vars — see src/lib/settings.ts.
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey(),
  adminUsername: varchar("admin_username", { length: 100 }).notNull(),
  adminPasswordHash: text("admin_password_hash").notNull(),
  scrapeConcurrency: integer("scrape_concurrency").notNull().default(5),
  scrapeTimeoutMs: integer("scrape_timeout_ms").notNull().default(12000),
  siteTitle: varchar("site_title", { length: 200 }).notNull().default("Serunee"),
  siteDescription: text("site_description")
    .notNull()
    .default("Agregasi berita real-time dari media lokal Aceh dan nasional."),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const radioStations = pgTable(
  "radio_stations",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    frequency: varchar("frequency", { length: 50 }),
    streamUrl: text("stream_url").notNull(),
    websiteUrl: text("website_url"),
    genre: varchar("genre", { length: 100 }),
    city: varchar("city", { length: 100 }).notNull().default("Banda Aceh"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    streamUrlUnique: uniqueIndex("radio_stations_stream_url_unique").on(table.streamUrl),
  })
);

export const videos = pgTable(
  "videos",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 300 }).notNull(),
    youtubeUrl: text("youtube_url").notNull(),
    youtubeId: varchar("youtube_id", { length: 20 }).notNull(),
    thumbnailUrl: text("thumbnail_url"),
    channelName: varchar("channel_name", { length: 200 }),
    category: varchar("category", { length: 100 }).notNull().default("Berita"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    youtubeIdUnique: uniqueIndex("videos_youtube_id_unique").on(table.youtubeId),
  })
);

export const socialPosts = pgTable(
  "social_posts",
  {
    id: serial("id").primaryKey(),
    platform: socialPlatformEnum("platform").notNull(),
    postUrl: text("post_url").notNull(),
    embedHtml: text("embed_html").notNull(),
    authorName: varchar("author_name", { length: 200 }),
    authorUrl: text("author_url"),
    caption: text("caption"),
    thumbnailUrl: text("thumbnail_url"),
    category: varchar("category", { length: 100 }).notNull().default("Berita"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    postUrlUnique: uniqueIndex("social_posts_post_url_unique").on(table.postUrl),
  })
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Keyword = typeof keywords.$inferSelect;
export type NewKeyword = typeof keywords.$inferInsert;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type ScrapeLog = typeof scrapeLogs.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
export type RadioStation = typeof radioStations.$inferSelect;
export type NewRadioStation = typeof radioStations.$inferInsert;
export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;
export type SocialPost = typeof socialPosts.$inferSelect;
export type NewSocialPost = typeof socialPosts.$inferInsert;
