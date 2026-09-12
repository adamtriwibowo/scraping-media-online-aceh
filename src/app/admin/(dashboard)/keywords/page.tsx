import { getDb } from "@/db";
import { keywords } from "@/db/schema";
import { desc } from "drizzle-orm";
import { deleteKeyword, toggleKeywordActive } from "./actions";
import { KeywordFormDialog } from "@/components/admin/keyword-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ActiveToggle } from "@/components/admin/active-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kelola Keyword" };

export default async function AdminKeywordsPage() {
  const db = getDb();
  const rows = await db.select().from(keywords).orderBy(desc(keywords.createdAt));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Kelola Keyword</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} keyword digunakan untuk menandai judul berita hasil scraping.
          </p>
        </div>
        <KeywordFormDialog />
      </div>

      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Kata kunci</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((kw) => (
              <TableRow key={kw.id} className="hover:bg-accent/40">
                <TableCell className="font-medium text-ink">{kw.word}</TableCell>
                <TableCell className="text-muted-foreground">{kw.label ?? "-"}</TableCell>
                <TableCell>
                  <ActiveToggle
                    active={kw.active}
                    onToggle={toggleKeywordActive.bind(null, kw.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <KeywordFormDialog keyword={kw} />
                    <ConfirmDeleteButton
                      onDelete={deleteKeyword.bind(null, kw.id)}
                      itemName={kw.word}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
