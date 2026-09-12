import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ArticleRow } from "@/lib/queries";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CategoryTag({ category }: { category: string }) {
  const lokal = category === "lokal";
  return (
    <span
      className={cn(
        "inline-block px-1.5 py-0.5 text-[11px] leading-none",
        lokal ? "bg-brass/15 text-brass-strong" : "bg-teal/12 text-teal-strong"
      )}
    >
      {lokal ? "Lokal" : "Nasional"}
    </span>
  );
}

export function NewsTable({ rows }: { rows: ArticleRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium text-ink">Tidak ada berita ditemukan</p>
        <p className="text-xs text-muted-foreground">
          Coba ubah filter atau jalankan scraping dari panel admin.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10 font-mono text-xs text-muted-foreground">#</TableHead>
            <TableHead>Judul berita</TableHead>
            <TableHead className="w-44">Sumber</TableHead>
            <TableHead className="w-40 font-mono text-xs">Tanggal</TableHead>
            <TableHead className="w-44">Kata kunci</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.id} className="hover:bg-accent/40">
              <TableCell className="font-mono text-xs text-muted-foreground tabular-figures">
                {String(idx + 1).padStart(2, "0")}
              </TableCell>
              <TableCell className="whitespace-normal align-top py-2.5">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-1.5 font-medium leading-snug text-ink hover:text-brass"
                >
                  <span>{row.title}</span>
                  <ExternalLink className="mt-1 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                </a>
                {row.snippet && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{row.snippet}</p>
                )}
              </TableCell>
              <TableCell className="align-top py-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm">{row.siteName}</span>
                  <CategoryTag category={row.siteCategory} />
                </div>
              </TableCell>
              <TableCell className="align-top py-2.5 font-mono text-xs text-muted-foreground tabular-figures">
                {formatDate(row.publishedAt ?? row.scrapedAt)}
              </TableCell>
              <TableCell className="align-top py-2.5">
                <div className="flex flex-wrap gap-1">
                  {row.matchedKeywords.slice(0, 3).map((kw) => (
                    <span
                      key={kw}
                      className="border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
