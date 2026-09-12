import { getVideos } from "@/lib/queries";
import { deleteVideo, toggleVideoActive } from "./actions";
import { VideoFormDialog } from "@/components/admin/video-form-dialog";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { ActiveToggle } from "@/components/admin/active-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kelola Video" };

export default async function AdminVideoPage() {
  const items = await getVideos();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Kelola Video</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} video terdaftar untuk halaman Video publik.
          </p>
        </div>
        <VideoFormDialog />
      </div>

      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Video</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Tampil</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada video terdaftar. Cek URL YouTube dulu lewat &quot;Cek Video&quot;, lalu
                  tambahkan di sini.
                </TableCell>
              </TableRow>
            )}
            {items.map((video) => (
              <TableRow key={video.id} className="hover:bg-accent/40">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {video.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={video.thumbnailUrl}
                        alt=""
                        className="h-10 w-[71px] shrink-0 border border-border object-cover"
                      />
                    )}
                    <div className="flex min-w-0 flex-col">
                      <span className="line-clamp-1 font-medium text-ink">{video.title}</span>
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-brass max-w-[220px]"
                      >
                        {video.youtubeUrl}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{video.category}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {video.channelName ?? "-"}
                </TableCell>
                <TableCell>
                  <ActiveToggle active={video.active} onToggle={toggleVideoActive.bind(null, video.id)} />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <VideoFormDialog video={video} />
                    <ConfirmDeleteButton onDelete={deleteVideo.bind(null, video.id)} itemName={video.title} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
