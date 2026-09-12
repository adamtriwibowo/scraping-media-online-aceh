import { SiteNav } from "@/components/site-nav";
import { getSettings } from "@/lib/settings";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav siteTitle={settings.siteTitle} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:px-6">{children}</main>
      <footer className="border-t border-border px-4 py-5 text-[13px] text-muted-foreground sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span>{settings.siteTitle} — pemantau media Aceh &amp; nasional</span>
          <span>Diperbarui berkala dari sumber RSS &amp; laman resmi</span>
        </div>
      </footer>
    </div>
  );
}
