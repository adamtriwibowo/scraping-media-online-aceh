import { getSitesWithStats } from "@/lib/queries";
import { deleteSite, toggleSiteActive } from "./actions";
import { SiteFormDialog } from "@/components/admin/site-form-dialog";
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
import { Rss, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kelola Website" };

export default async function AdminWebsitesPage() {
  const sites = await getSitesWithStats();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Kelola Website</h1>
          <p className="text-sm text-muted-foreground">
            {sites.length} sumber media terdaftar untuk proses scraping.
          </p>
        </div>
        <SiteFormDialog />
      </div>

      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>RSS</TableHead>
              <TableHead className="text-right">Berita</TableHead>
              <TableHead>Aktif</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.map((site) => (
              <TableRow key={site.id} className="hover:bg-accent/40">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{site.name}</span>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-muted-foreground hover:text-brass max-w-[220px]"
                    >
                      {site.url}
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-block px-1.5 py-0.5 text-[11px] leading-none",
                      site.category === "nasional"
                        ? "bg-teal/12 text-teal-strong"
                        : "bg-brass/15 text-brass-strong"
                    )}
                  >
                    {site.category === "nasional" ? "Nasional" : "Lokal"}
                  </span>
                </TableCell>
                <TableCell>
                  {site.rssUrl ? (
                    <Rss className="h-4 w-4 text-brass" />
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">HTML</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono tabular-figures">
                  {site.articleCount.toLocaleString("id-ID")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <ActiveToggle
                      active={site.active}
                      onToggle={toggleSiteActive.bind(null, site.id)}
                    />
                    {site.lastError && (
                      <span title={site.lastError}>
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <SiteFormDialog site={site} />
                    <ConfirmDeleteButton
                      onDelete={deleteSite.bind(null, site.id)}
                      itemName={site.name}
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
