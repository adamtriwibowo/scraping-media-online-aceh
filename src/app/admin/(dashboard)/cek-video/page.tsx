import { VideoChecker } from "@/components/admin/video-checker";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cek Video" };

export default function CekVideoPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Cek Video</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Tempel URL video YouTube untuk memastikan videonya masih ada dan mengambil judul,
          channel, serta thumbnail secara otomatis sebelum ditambahkan ke halaman Video publik.
        </p>
      </div>

      <VideoChecker />
    </div>
  );
}
