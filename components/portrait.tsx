import Image from "next/image";
import { cn } from "@/lib/utils";

/** Duotone/grayscale portrait toned to the violet accent. */
export function Portrait({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Soft accent glow behind the frame */}
      <div
        aria-hidden
        className="bg-accent/20 absolute -inset-6 -z-10 rounded-[2rem] blur-3xl"
      />
      <div className="glass relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem]">
        <Image
          src="/portrait.jpg"
          alt="Sina Amareh"
          fill
          priority
          sizes="(max-width: 768px) 78vw, 420px"
          className="object-cover contrast-[1.05] grayscale"
          style={{ objectPosition: "58% 24%" }}
        />
        {/* Violet duotone tint */}
        <div
          aria-hidden
          className="from-accent/55 to-accent-2/25 absolute inset-0 bg-gradient-to-tr via-transparent mix-blend-color"
        />
        {/* Bottom fade into the page */}
        <div
          aria-hidden
          className="from-bg/70 absolute inset-0 bg-gradient-to-t to-transparent"
        />
        {/* Subtle inner ring */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/10"
        />
      </div>
    </div>
  );
}
