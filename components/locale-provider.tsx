"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { dict, type Dict } from "@/lib/dictionary";
import { localizedPath, stripLocale, type Locale } from "@/lib/locale";

type LocaleContextValue = {
  locale: Locale;
  t: Dict;
  /** A bare site path ("/projects", "/#about") as a link in the current language. */
  path: (bare: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** The locale comes from the URL (app/[lang]); switching languages is a navigation. */
export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value: LocaleContextValue = {
    locale,
    t: dict[locale] as Dict,
    path: (bare) => localizedPath(bare, locale),
  };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

/**
 * The current path without its locale prefix. Use this, never a raw
 * usePathname(), for anything rendered: under the proxy's rewrite the server
 * prerenders "/en/projects" while the browser is at "/projects", and the
 * mismatch would break hydration.
 */
export function useBarePath(): string {
  return stripLocale(usePathname());
}
