import { cn } from "@/lib/utils";

export function StatRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 divide-x divide-y divide-border border border-border sm:grid-cols-4 sm:divide-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        <span className="text-[13px]">{label}</span>
      </div>
      <p
        className={cn(
          "font-mono text-[1.6rem] leading-none font-medium tabular-figures",
          accent ? "text-brass" : "text-foreground"
        )}
      >
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </p>
    </div>
  );
}
