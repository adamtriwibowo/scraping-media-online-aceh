import { StreamChecker } from "@/components/admin/stream-checker";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cek Stream" };

export default function CekStreamPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Cek Stream</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Periksa apakah URL stream sebuah radio benar-benar aktif dan bisa diputar sebelum
          ditambahkan ke halaman Radio Online publik. Mendukung link stream langsung maupun file
          playlist (.pls/.m3u).
        </p>
      </div>

      <StreamChecker />
    </div>
  );
}
