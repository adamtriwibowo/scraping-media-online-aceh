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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Site } from "@/db/schema";
import { createSite, updateSite } from "@/app/admin/(dashboard)/websites/actions";
import { Plus, Pencil } from "lucide-react";

export function SiteFormDialog({ site }: { site?: Site }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(site);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateSite(site!.id, formData)
        : await createSite(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Website berhasil diperbarui" : "Website berhasil ditambahkan");
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
            Tambah Website
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Website" : "Tambah Website"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nama Media</Label>
            <Input id="name" name="name" defaultValue={site?.name} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="url">URL Website</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://contoh.com"
              defaultValue={site?.url}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rssUrl">URL RSS Feed (opsional)</Label>
            <Input
              id="rssUrl"
              name="rssUrl"
              type="url"
              placeholder="https://contoh.com/feed/"
              defaultValue={site?.rssUrl ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Kosongkan jika tidak ada — sistem akan mencoba mengambil judul dari halaman utama.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Kategori</Label>
            <Select name="category" defaultValue={site?.category ?? "lokal"}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lokal">Lokal (Aceh)</SelectItem>
                <SelectItem value="nasional">Nasional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="active" className="text-sm font-normal">
              Aktif discraping
            </Label>
            <Switch id="active" name="active" defaultChecked={site?.active ?? true} />
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
