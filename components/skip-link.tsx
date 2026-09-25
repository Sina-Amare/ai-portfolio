"use client";

import { useLocale } from "@/components/locale-provider";
import { pageCopy } from "@/lib/page-copy";

export function SkipLink() {
  const { locale } = useLocale();
  return (
    <a
      href="#content"
      className="focus:bg-accent focus:text-accent-contrast sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm"
    >
      {pageCopy[locale].skip}
    </a>
  );
}
