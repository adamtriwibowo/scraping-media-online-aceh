"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { Video } from "@/db/schema";
import { createVideo, updateVideo } from "@/app/admin/(dashboard)/video/actions";
import { Plus, Pencil } from "lucide-react";

export function VideoFormDialog({
  video,
  initial,
}: {
  video?: Video;
  initial?: { title?: string; youtubeUrl?: string; thumbnailUrl?: string; channelName?: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(video);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateVideo(video!.id, formData)
        : await createVideo(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Video berhasil diperbarui" : "Video berhasil ditambahkan");
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Tambah Video
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Video" : "Tambah Video"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Judul</Label>
            <Input id="title" name="title" defaultValue={video?.title ?? initial?.title} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="youtubeUrl">URL YouTube</Label>
            <Input
              id="youtubeUrl"
              name="youtubeUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              defaultValue={video?.youtubeUrl ?? initial?.youtubeUrl}
              required
            />
            <p className="text-xs text-muted-foreground">
              Cek dulu lewat &quot;Cek Video&quot; agar judul &amp; thumbnail terisi otomatis.
            </p>
          </div>
          <input type="hidden" name="thumbnailUrl" value={video?.thumbnailUrl ?? initial?.thumbnailUrl ?? ""} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="channelName">Nama Channel (opsional)</Label>
            <Input
              id="channelName"
              name="channelName"
              defaultValue={video?.channelName ?? initial?.channelName ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              name="category"
              list="video-category-options"
              defaultValue={video?.category ?? "Berita"}
              required
            />
            <datalist id="video-category-options">
              <option value="Berita" />
              <option value="Budaya" />
              <option value="Wisata" />
              <option value="Edukasi" />
              <option value="Hiburan" />
            </datalist>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="active" className="text-sm font-normal">
              Tampilkan di halaman publik
            </Label>
            <Switch id="active" name="active" defaultChecked={video?.active ?? true} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
