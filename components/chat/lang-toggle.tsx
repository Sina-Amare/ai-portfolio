"use client";

import { ui, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LangToggle({
  lang,
  onChange,
  className,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border p-0.5",
        className,
      )}
    >
      {(["en", "fa"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-full px-3.5 py-1.5 font-mono text-[11px] transition-colors",
            lang === l
              ? "bg-accent-soft text-accent-text"
              : "text-muted hover:text-text",
          )}
        >
          {ui[l].label}
        </button>
      ))}
    </div>
  );
}
