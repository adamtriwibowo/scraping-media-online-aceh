import { getSitesWithStats } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Rss, ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Website" };

export default async function WebsitesPage() {
  const sites = await getSitesWithStats();
  const lokal = sites.filter((s) => s.category === "lokal");
  const nasional = sites.filter((s) => s.category === "nasional");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Daftar Website</h1>
        <p className="text-sm text-muted-foreground">
          {sites.length} sumber media dipantau — {lokal.length} lokal, {nasional.length} nasional.
        </p>
      </div>

      <SiteGroup title="Media Lokal Aceh" sites={lokal} />
      <SiteGroup title="Media Nasional" sites={nasional} />
    </div>
  );
}

function SiteGroup({
  title,
  sites,
}: {
  title: string;
  sites: Awaited<ReturnType<typeof getSitesWithStats>>;
}) {
  if (sites.length === 0) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-medium">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => (
          <Card key={site.id} className="transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-medium hover:text-primary"
                >
                  {site.name}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                {!site.active && (
                  <Badge variant="outline" className="text-[10px]">
                    nonaktif
                  </Badge>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{site.url}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-semibold text-primary">
                  {site.articleCount.toLocaleString("id-ID")}{" "}
                  <span className="font-normal text-muted-foreground">berita</span>
                </span>
                {site.rssUrl && (
                  <a
                    href={site.rssUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Rss className="h-3.5 w-3.5" />
                    RSS
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
