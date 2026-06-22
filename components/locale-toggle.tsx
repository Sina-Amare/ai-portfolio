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
            "rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors",
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
