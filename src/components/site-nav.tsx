"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";
import { Newspaper, Globe, BarChart3, Tags, ShieldCheck, Radio, Clapperboard } from "lucide-react";

const links = [
  { href: "/", label: "Semua Berita", icon: Newspaper },
  { href: "/websites", label: "Website", icon: Globe },
  { href: "/radio", label: "Radio", icon: Radio },
  { href: "/video", label: "Video", icon: Clapperboard },
  { href: "/statistik", label: "Statistik", icon: BarChart3 },
  { href: "/keywords", label: "Keywords", icon: Tags },
];

export function SiteNav({ siteTitle }: { siteTitle: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/85">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <BrandMark className="h-7 w-7 text-brass" />
          <span className="font-heading text-[1.35rem] italic leading-none tracking-tight text-ink">
            {siteTitle}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-brass text-ink font-medium"
                    : "border-transparent text-muted-foreground hover:text-ink"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/admin"
          className="flex items-center gap-1.5 border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-ink hover:text-ink transition-colors shrink-0"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>

      <nav className="flex md:hidden items-center gap-3 overflow-x-auto px-4 pb-2.5 text-sm">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap border-b-2 pb-0.5 transition-colors",
                active ? "border-brass text-ink font-medium" : "border-transparent text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
