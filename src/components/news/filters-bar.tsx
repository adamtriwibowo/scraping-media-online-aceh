"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, X } from "lucide-react";

type SiteOption = { id: number; name: string; category: string };

export function FiltersBar({ sites }: { sites: SiteOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search || null);
  }

  function resetFilters() {
    setSearch("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const exportHref = `/api/export?${searchParams.toString()}`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={searchParams.get("siteId") ?? "all"}
          onValueChange={(v) => updateParam("siteId", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Semua Website" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Website</SelectItem>
            {sites.map((site) => (
              <SelectItem key={site.id} value={String(site.id)}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(v) => updateParam("category", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            <SelectItem value="lokal">Lokal</SelectItem>
            <SelectItem value="nasional">Nasional</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => updateParam("from", e.target.value || null)}
          className="w-full sm:w-40"
        />
        <span className="text-sm text-muted-foreground hidden sm:inline">s/d</span>
        <Input
          type="date"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => updateParam("to", e.target.value || null)}
          className="w-full sm:w-40"
        />

        <Button type="button" variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearchSubmit} className="flex flex-1 min-w-[220px] gap-2">
          <Input
            placeholder="Cari judul berita..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" size="icon" variant="secondary" disabled={isPending}>
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Button asChild variant="outline" className="gap-1.5">
          <a href={exportHref}>
            <Download className="h-4 w-4" />
            Export XLS
          </a>
        </Button>
      </div>
    </div>
  );
}
