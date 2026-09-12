import Link from "next/link";
import { LayoutDashboard, Globe, Tags, Newspaper } from "lucide-react";
import { LogoutButton } from "@/components/admin/logout-button";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/websites", label: "Kelola Website", icon: Globe },
  { href: "/admin/keywords", label: "Kelola Keyword", icon: Tags },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </span>
          <span className="font-semibold">Admin Panel</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex flex-col gap-1 border-t border-sidebar-border pt-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <Newspaper className="h-4 w-4" />
            Lihat Situs Publik
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-8">{children}</main>
    </div>
  );
}
