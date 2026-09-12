"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Newspaper, Globe, BarChart3, Tags, ShieldCheck } from "lucide-react";

const links = [
  { href: "/", label: "Semua Berita", icon: Newspaper },
  { href: "/websites", label: "Website", icon: Globe },
  { href: "/statistik", label: "Statistik", icon: BarChart3 },
  { href: "/keywords", label: "Keywords", icon: Tags },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </span>
          <span className="font-semibold tracking-tight text-lg">
            Serunee<span className="text-primary">3.0</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/admin"
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
        >
          <ShieldCheck className="h-4 w-4" />
          <span className="hidden sm:inline">Admin</span>
        </Link>
      </div>

      <nav className="flex md:hidden items-center gap-1 overflow-x-auto px-4 pb-2">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
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
