"use client";

import { cn } from "@/lib/utils";

export function Suggestions({
  items,
  onPick,
  dir,
}: {
  items: readonly string[];
  onPick: (text: string) => void;
  dir: "ltr" | "rtl";
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", dir === "rtl" && "font-fa")}>
      {items.map((s) => (
        <button
          key={s}
          type="button"
          dir={dir}
          onClick={() => onPick(s)}
          className="text-muted hover:text-text hover:bg-accent-soft rounded-full border border-border px-3 py-1.5 text-[13px] transition-colors hover:border-accent/50"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
