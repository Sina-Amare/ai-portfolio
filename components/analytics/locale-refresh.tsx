"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

/** The private dashboard renders its data on the server, so refetch it after a language switch. */
export function AdminLocaleRefresh() {
  const { locale } = useLocale();
  const router = useRouter();
  const previous = useRef(locale);

  useEffect(() => {
    if (previous.current !== locale) {
      previous.current = locale;
      router.refresh();
    }
  }, [locale, router]);

  return null;
}
