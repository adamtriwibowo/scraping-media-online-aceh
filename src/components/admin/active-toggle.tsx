"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export function ActiveToggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: (active: boolean) => Promise<void>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Switch
      checked={active}
      disabled={isPending}
      onCheckedChange={(checked) => {
        startTransition(async () => {
          await onToggle(checked);
          router.refresh();
        });
      }}
    />
  );
}
