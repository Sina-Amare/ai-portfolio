import { cn } from "@/lib/utils";

export function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-mono text-muted inline-flex items-center rounded-full border border-border px-2.5 py-1 text-[11px] tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}
