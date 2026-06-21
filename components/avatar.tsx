import Image from "next/image";
import { cn } from "@/lib/utils";

/** Small, natural-toned circular avatar with a faint amber halo (both themes). */
export function Avatar({
  size = 40,
  status = false,
  className,
}: {
  size?: number;
  status?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/portrait.jpg"
        alt="Sina Amareh"
        fill
        sizes={`${size * 2}px`}
        priority
        className="rounded-full object-cover"
        style={{ objectPosition: "57% 22%", filter: "saturate(0.95) contrast(1.02)" }}
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full ring-1 ring-inset ring-[color:var(--border)]"
        style={{ boxShadow: "0 0 0 4px var(--accent-soft)" }}
      />
      {status && (
        <span
          aria-hidden
          className="bg-accent absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full ring-2 ring-[color:var(--bg)]"
        />
      )}
    </span>
  );
}
