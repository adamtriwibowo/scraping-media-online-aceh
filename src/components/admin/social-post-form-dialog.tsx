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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SocialPost } from "@/db/schema";
import { createSocialPost, updateSocialPost } from "@/app/admin/(dashboard)/media-sosial/actions";
import { Plus, Pencil } from "lucide-react";

export function SocialPostFormDialog({
  post,
  initial,
}: {
  post?: SocialPost;
  initial?: {
    platform?: "tiktok" | "x";
    postUrl?: string;
    embedHtml?: string;
    authorName?: string;
    authorUrl?: string;
    caption?: string;
    thumbnailUrl?: string;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(post);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateSocialPost(post!.id, formData)
        : await createSocialPost(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Post berhasil diperbarui" : "Post berhasil ditambahkan");
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
            Tambah Post
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Post" : "Tambah Post"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="platform">Platform</Label>
            <Select name="platform" defaultValue={post?.platform ?? initial?.platform ?? "tiktok"}>
              <SelectTrigger id="platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="postUrl">URL Post</Label>
            <Input
              id="postUrl"
              name="postUrl"
              type="url"
              defaultValue={post?.postUrl ?? initial?.postUrl}
              required
            />
            <p className="text-xs text-muted-foreground">
              Cek dulu lewat &quot;Cek URL&quot; agar embed, judul, dan penulis terisi otomatis.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="embedHtml">Embed HTML</Label>
            <Textarea
              id="embedHtml"
              name="embedHtml"
              rows={3}
              defaultValue={post?.embedHtml ?? initial?.embedHtml}
              className="font-mono text-xs"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="caption">Caption (opsional)</Label>
            <Textarea id="caption" name="caption" rows={2} defaultValue={post?.caption ?? initial?.caption ?? ""} />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="authorName">Nama Akun (opsional)</Label>
              <Input id="authorName" name="authorName" defaultValue={post?.authorName ?? initial?.authorName ?? ""} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                name="category"
                list="social-category-options"
                defaultValue={post?.category ?? "Berita"}
                className="sm:w-40"
                required
              />
              <datalist id="social-category-options">
                <option value="Berita" />
                <option value="Budaya" />
                <option value="Wisata" />
                <option value="Edukasi" />
                <option value="Hiburan" />
              </datalist>
            </div>
          </div>
          <input type="hidden" name="authorUrl" value={post?.authorUrl ?? initial?.authorUrl ?? ""} />
          <input type="hidden" name="thumbnailUrl" value={post?.thumbnailUrl ?? initial?.thumbnailUrl ?? ""} />
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="active" className="text-sm font-normal">
              Tampilkan di halaman publik
            </Label>
            <Switch id="active" name="active" defaultChecked={post?.active ?? true} />
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
