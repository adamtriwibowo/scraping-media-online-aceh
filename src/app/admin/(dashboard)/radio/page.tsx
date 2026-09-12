import { getRadioStations } from "@/lib/queries";
import { deleteRadioStation, toggleRadioStationActive } from "./actions";
import { RadioFormDialog } from "@/components/admin/radio-form-dialog";
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

export const metadata: Metadata = { title: "Kelola Radio" };

export default async function AdminRadioPage() {
  const stations = await getRadioStations();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Kelola Radio</h1>
          <p className="text-sm text-muted-foreground">
            {stations.length} stasiun radio terdaftar untuk halaman Radio Online publik.
          </p>
        </div>
        <RadioFormDialog />
      </div>

      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Nama</TableHead>
              <TableHead>Frekuensi</TableHead>
              <TableHead>Genre</TableHead>
              <TableHead>Kota</TableHead>
              <TableHead>Tampil</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Belum ada radio terdaftar. Cek URL stream dulu lewat &quot;Cek Stream&quot;, lalu
                  tambahkan di sini.
                </TableCell>
              </TableRow>
            )}
            {stations.map((station) => (
              <TableRow key={station.id} className="hover:bg-accent/40">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-ink">{station.name}</span>
                    {station.websiteUrl && (
                      <a
                        href={station.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-brass max-w-[220px]"
                      >
                        {station.websiteUrl}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {station.frequency ?? "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{station.genre ?? "-"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{station.city}</TableCell>
                <TableCell>
                  <ActiveToggle
                    active={station.active}
                    onToggle={toggleRadioStationActive.bind(null, station.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <RadioFormDialog station={station} />
                    <ConfirmDeleteButton
                      onDelete={deleteRadioStation.bind(null, station.id)}
                      itemName={station.name}
                    />
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
