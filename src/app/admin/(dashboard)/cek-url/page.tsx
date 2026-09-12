import { Suspense } from "react";
import { CekUrlTabs } from "@/components/admin/cek-url-tabs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cek URL" };

export default function CekUrlPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Cek URL</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Validasi sumber sebelum ditambahkan ke database — feed berita, stream radio, atau video
          YouTube.
        </p>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <CekUrlTabs />
      </Suspense>
    </div>
  );
}
