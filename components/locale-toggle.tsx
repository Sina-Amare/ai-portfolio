"use client";

import { useLocale } from "@/components/locale-provider";
import { cn } from "@/lib/utils";

const LABELS = { en: "EN", fa: "فا" } as const;

/** Compact site-wide language switch (English / Persian). */
export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "border-border inline-flex items-center rounded-full border p-0.5",
        className,
      )}
    >
      {(["en", "fa"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            // Bigger tap target on touch/mobile (>=40px), compact on md+ desktop.
            "inline-flex min-h-[40px] items-center justify-center rounded-full px-3 py-2 font-mono text-xs transition-colors md:min-h-0 md:px-2.5 md:py-1 md:text-[11px]",
            locale === l
              ? "bg-accent-soft text-accent-text"
              : "text-muted hover:text-text",
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
