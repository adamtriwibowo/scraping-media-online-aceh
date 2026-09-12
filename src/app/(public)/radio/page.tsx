import { getRadioStations } from "@/lib/queries";
import { RadioList } from "@/components/radio/radio-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Radio Online" };

export default async function RadioPage() {
  const stations = await getRadioStations({ activeOnly: true });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-[1.7rem] italic tracking-tight text-ink">Radio Online</h1>
        <p className="text-sm text-muted-foreground">
          Dengarkan siaran radio lokal Banda Aceh &amp; sekitarnya langsung dari browser.
        </p>
      </div>

      <RadioList stations={stations} />
    </div>
  );
}
