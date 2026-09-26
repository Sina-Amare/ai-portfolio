import { cn } from "@/lib/utils";

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-muted border-border inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}
