"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { dict, dirOf, type Dict, type Locale } from "@/lib/dictionary";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  t: Dict;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initial,
  children,
}: {
  initial: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initial);

  const apply = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem("locale", l);
      document.cookie = `locale=${l};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* storage unavailable — non-fatal */
    }
    const html = document.documentElement;
    html.lang = l;
    html.dir = dirOf(l);
    html.setAttribute("data-locale", l);
    // brief crossfade so the LTR↔RTL reflow doesn't snap.
    html.classList.add("locale-switching");
    window.setTimeout(() => html.classList.remove("locale-switching"), 450);
  }, []);

  const setLocale = useCallback(
    (l: Locale) => {
      if (l !== locale) apply(l);
    },
    [locale, apply],
  );

  const toggle = useCallback(
    () => apply(locale === "fa" ? "en" : "fa"),
    [locale, apply],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, toggle, t: dict[locale] as Dict }),
    [locale, setLocale, toggle],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
