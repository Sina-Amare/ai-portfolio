import { cn } from "@/lib/utils";

export function GlassCard({
  className,
  glow,
  children,
}: {
  className?: string;
  glow?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "glass rounded-[var(--radius-card)]",
        glow && "glow-accent",
        className,
      )}
    >
      {children}
    </div>
  );
}
