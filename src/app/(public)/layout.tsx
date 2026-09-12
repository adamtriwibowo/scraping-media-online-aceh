import { SiteNav } from "@/components/site-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Serunee 3.0 — Monitoring Media Online Aceh &amp; Nasional
      </footer>
    </div>
  );
}
