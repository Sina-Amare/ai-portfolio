"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBarePath, useLocale } from "@/components/locale-provider";
import { LOCALE_COOKIE, LOCALES, localizedPath, type Locale } from "@/lib/locale";
import { cn } from "@/lib/utils";

const LABELS = { en: "EN", fa: "فا" } as const;

/** The only writer of the locale cookie: an explicit choice the proxy honours on the next visit. */
function rememberLocale(l: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${l};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* cookies unavailable — the switch still works, it just isn't remembered */
  }
}

/**
 * Site-wide language switch. Real links to the other language's URL (crawlable,
 * work without JS, open in a new tab); a plain click also remembers the choice
 * for the proxy and keeps the current #section.
 */
export function LocaleToggle({ className, disabled }: { className?: string; disabled?: boolean }) {
  const { locale, t } = useLocale();
  const bare = useBarePath();
  const router = useRouter();

  const onClick = (e: React.MouseEvent, l: Locale) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    rememberLocale(l);
    if (l !== locale) {
      router.push(localizedPath(bare, l) + window.location.search + window.location.hash);
    }
  };

  return (
    <div
      role="group"
      aria-label={t.nav.language}
      // inert: no clicks, no focus. Switching is a navigation that would drop an in-flight chat answer.
      inert={disabled}
      className={cn(
        "border-border inline-flex items-center rounded-full border p-0.5 transition-opacity",
        disabled && "opacity-50",
        className,
      )}
    >
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={localizedPath(bare, l)}
          hrefLang={l}
          lang={l}
          aria-current={locale === l ? "true" : undefined}
          onClick={(e) => onClick(e, l)}
          className={cn(
            // Bigger tap target on touch/mobile (>=40px), compact on md+ desktop.
            "inline-flex min-h-[40px] items-center justify-center rounded-full px-3 py-2 font-mono text-xs transition-colors md:min-h-0 md:px-2.5 md:py-1 md:text-[11px]",
            locale === l ? "bg-accent-soft text-accent-text" : "text-muted hover:text-text",
          )}
        >
          {LABELS[l]}
        </Link>
      ))}
    </div>
  );
}
