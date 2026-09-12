import { getSitesWithStats } from "@/lib/queries";
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
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Daftar Website</h1>
        <p className="text-sm text-muted-foreground">
          {sites.length} sumber media dipantau — {lokal.length} lokal, {nasional.length} nasional.
        </p>
      </div>

      <SiteGroup title="Media lokal Aceh" accent="brass" sites={lokal} />
      <SiteGroup title="Media nasional" accent="teal" sites={nasional} />
    </div>
  );
}

function SiteGroup({
  title,
  accent,
  sites,
}: {
  title: string;
  accent: "brass" | "teal";
  sites: Awaited<ReturnType<typeof getSitesWithStats>>;
}) {
  if (sites.length === 0) return null;
  return (
    <div>
      <h2
        className={`mb-3 border-b-2 pb-1.5 text-[13px] font-medium text-ink ${
          accent === "brass" ? "border-brass" : "border-teal"
        }`}
      >
        {title}
      </h2>
      <div className="divide-y divide-border border border-border">
        {sites.map((site) => (
          <div
            key={site.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-medium text-ink hover:text-brass"
                >
                  {site.name}
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
                {!site.active && (
                  <span className="border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    nonaktif
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{site.url}</p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              {site.rssUrl && (
                <a
                  href={site.rssUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-brass"
                >
                  <Rss className="h-3.5 w-3.5" />
                  RSS
                </a>
              )}
              <span className="font-mono text-sm tabular-figures text-ink">
                {site.articleCount.toLocaleString("id-ID")}
                <span className="ml-1 font-sans text-xs font-normal text-muted-foreground">berita</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
