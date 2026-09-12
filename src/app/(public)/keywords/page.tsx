import { getDb } from "@/db";
import { keywords } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Keywords" };

export default async function KeywordsPage() {
  const db = getDb();
  const rows = await db.select().from(keywords).orderBy(desc(keywords.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Keywords</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Keyword filter dari hasil scraping website berita. Setiap judul berita akan ditandai
          apabila cocok dengan salah satu kata kunci pada daftar berikut.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-2 p-4">
          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada keyword terdaftar.</p>
          )}
          {rows.map((kw) => (
            <Badge
              key={kw.id}
              variant={kw.active ? "default" : "outline"}
              className="px-3 py-1 text-sm"
            >
              {kw.word}
              {kw.label && <span className="ml-1.5 opacity-70">· {kw.label}</span>}
            </Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
