import { getDb } from "@/db";
import { keywords } from "@/db/schema";
import { desc } from "drizzle-orm";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Keywords" };

export default async function KeywordsPage() {
  const db = getDb();
  const rows = await db.select().from(keywords).orderBy(desc(keywords.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Keywords</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Keyword filter dari hasil scraping website berita. Setiap judul berita akan ditandai
          apabila cocok dengan salah satu kata kunci pada daftar berikut.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border border-border p-4">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada keyword terdaftar.</p>
        )}
        {rows.map((kw) => (
          <span
            key={kw.id}
            className={cn(
              "flex items-center gap-1.5 border px-2.5 py-1 text-sm",
              kw.active
                ? "border-brass/40 bg-brass/10 text-brass-strong"
                : "border-border text-muted-foreground"
            )}
          >
            {kw.word}
            {kw.label && <span className="text-xs opacity-70">{kw.label}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
