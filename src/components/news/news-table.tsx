import { Badge } from "@/components/ui/badge";
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

export function NewsTable({ rows }: { rows: ArticleRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
        <p className="text-sm font-medium">Tidak ada berita ditemukan</p>
        <p className="text-xs text-muted-foreground">
          Coba ubah filter atau jalankan scraping dari panel admin.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Judul Berita</TableHead>
            <TableHead className="w-44">Sumber</TableHead>
            <TableHead className="w-44">Tanggal</TableHead>
            <TableHead className="w-40">Keyword</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row.id}>
              <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
              <TableCell>
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-1.5 font-medium leading-snug hover:text-primary"
                >
                  <span>{row.title}</span>
                  <ExternalLink className="mt-1 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                </a>
                {row.snippet && (
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{row.snippet}</p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm">{row.siteName}</span>
                  <Badge
                    variant={row.siteCategory === "nasional" ? "default" : "secondary"}
                    className="w-fit text-[10px]"
                  >
                    {row.siteCategory}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDate(row.publishedAt ?? row.scrapedAt)}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {row.matchedKeywords.slice(0, 3).map((kw) => (
                    <Badge key={kw} variant="outline" className="text-[10px]">
                      {kw}
                    </Badge>
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
