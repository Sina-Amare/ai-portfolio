import { cn } from "@/lib/utils";

/** Subtle, slow-drifting amber orbs (pure CSS; respects reduced motion). */
export function AnimatedBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-20 overflow-hidden",
        className,
      )}
    >
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
    </div>
  );
}
