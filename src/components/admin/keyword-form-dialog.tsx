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
import type { Keyword } from "@/db/schema";
import { createKeyword, updateKeyword } from "@/app/admin/(dashboard)/keywords/actions";
import { Plus, Pencil } from "lucide-react";

export function KeywordFormDialog({ keyword }: { keyword?: Keyword }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(keyword);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const result = isEdit
        ? await updateKeyword(keyword!.id, formData)
        : await createKeyword(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? "Keyword berhasil diperbarui" : "Keyword berhasil ditambahkan");
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
            Tambah Keyword
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Keyword" : "Tambah Keyword"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="word">Kata Kunci</Label>
            <Input id="word" name="word" defaultValue={keyword?.word} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label">Label (opsional)</Label>
            <Input
              id="label"
              name="label"
              placeholder="mis. Pemilu, Bencana, Ekonomi"
              defaultValue={keyword?.label ?? ""}
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
            <Label htmlFor="active" className="text-sm font-normal">
              Aktif digunakan untuk filter
            </Label>
            <Switch id="active" name="active" defaultChecked={keyword?.active ?? true} />
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
