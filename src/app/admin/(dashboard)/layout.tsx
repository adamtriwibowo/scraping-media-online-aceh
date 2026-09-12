"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Tags,
  Newspaper,
  Settings,
  Radio,
  Clapperboard,
  ScanSearch,
} from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/websites", label: "Kelola Website", icon: Globe },
  { href: "/admin/keywords", label: "Kelola Keyword", icon: Tags },
  { href: "/admin/radio", label: "Kelola Radio", icon: Radio },
  { href: "/admin/video", label: "Kelola Video", icon: Clapperboard },
  { href: "/admin/cek-url", label: "Cek URL", icon: ScanSearch },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar px-0 py-5 md:flex">
        <div className="mb-6 flex items-center gap-2.5 px-5">
          <BrandMark className="h-6 w-6 text-sidebar-primary" />
          <div className="leading-tight">
            <p className="font-heading text-lg italic text-sidebar-foreground">Serunee</p>
            <p className="text-[11px] text-sidebar-foreground/55">Panel admin</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 border-l-2 px-5 py-2.5 text-sm transition-colors",
                  active
                    ? "border-sidebar-primary bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "border-transparent text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-0.5 border-t border-sidebar-border pt-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 border-l-2 border-transparent px-5 py-2.5 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          >
            <Newspaper className="h-4 w-4" />
            Lihat situs publik
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
    </div>
  );
}
