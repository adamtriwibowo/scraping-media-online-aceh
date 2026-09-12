import { cn } from "@/lib/utils";

/**
 * Abstract mark for Serunee: the conical bell of a serune kalèe (Acehnese
 * reed horn) with three signal arcs radiating from it — the instrument that
 * calls out, echoed as the product that listens across many sources.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path
        d="M6 19.5 19 24.5C20.5 25.5 22 24.5 22 22.5V9.5C22 7.5 20.5 6.5 19 7.5L6 12.5V19.5Z"
        fill="currentColor"
      />
      <rect x="3.5" y="13.2" width="3" height="5.6" rx="1" fill="currentColor" />
      <path
        d="M25.5 12.5C26.7 14.1 26.7 17.9 25.5 19.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M28.3 9.5C30.7 12.7 30.7 19.3 28.3 22.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
