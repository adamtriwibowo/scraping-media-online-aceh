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
import type { RadioStation } from "@/db/schema";
import { createRadioStation, updateRadioStation } from "@/app/admin/(dashboard)/radio/actions";
import { Plus, Pencil } from "lucide-react";

export function RadioFormDialog({
  station,
  initial,
}: {
  station?: RadioStation;
  initial?: { name?: string; streamUrl?: string; genre?: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(station);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateRadioStation(station!.id, formData)
        : await createRadioStation(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Radio berhasil diperbarui" : "Radio berhasil ditambahkan");
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
            Tambah Radio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Radio" : "Tambah Radio"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nama Radio</Label>
            <Input id="name" name="name" defaultValue={station?.name ?? initial?.name} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="frequency">Frekuensi (opsional)</Label>
            <Input
              id="frequency"
              name="frequency"
              placeholder="Contoh: 101.5 FM"
              defaultValue={station?.frequency ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="streamUrl">URL Stream</Label>
            <Input
              id="streamUrl"
              name="streamUrl"
              type="url"
              placeholder="https://stream.contoh.com/live"
              defaultValue={station?.streamUrl ?? initial?.streamUrl}
              required
            />
            <p className="text-xs text-muted-foreground">
              Cek dulu lewat &quot;Cek Stream&quot; agar URL sudah ditest dan valid.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="websiteUrl">Situs Resmi (opsional)</Label>
            <Input
              id="websiteUrl"
              name="websiteUrl"
              type="url"
              placeholder="https://contoh.com"
              defaultValue={station?.websiteUrl ?? ""}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="genre">Genre (opsional)</Label>
            <Input
              id="genre"
              name="genre"
              placeholder="Contoh: Berita, Dakwah, Musik"
              defaultValue={station?.genre ?? initial?.genre}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">Kota</Label>
            <Input id="city" name="city" defaultValue={station?.city ?? "Banda Aceh"} required />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="active" className="text-sm font-normal">
              Tampilkan di halaman publik
            </Label>
            <Switch id="active" name="active" defaultChecked={station?.active ?? true} />
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
