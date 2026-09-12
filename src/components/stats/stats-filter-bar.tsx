"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function StatsFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function resetFilters() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilter = searchParams.has("from") || searchParams.has("to") || searchParams.has("granularity");

  return (
    <div className="flex flex-wrap items-center gap-2 border border-border p-4">
      <Select
        value={searchParams.get("granularity") ?? "day"}
        onValueChange={(v) => updateParam("granularity", v === "day" ? null : v)}
      >
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Harian</SelectItem>
          <SelectItem value="month">Bulanan</SelectItem>
          <SelectItem value="year">Tahunan</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => updateParam("from", e.target.value || null)}
        className="w-full sm:w-40"
      />
      <span className="hidden text-sm text-muted-foreground sm:inline">s/d</span>
      <Input
        type="date"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => updateParam("to", e.target.value || null)}
        className="w-full sm:w-40"
      />

      {hasFilter && (
        <Button type="button" variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
          <X className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}
