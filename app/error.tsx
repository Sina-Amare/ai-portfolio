"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useLocale } from "@/components/locale-provider";
import { pageCopy } from "@/lib/page-copy";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useLocale();
  const p = pageCopy[locale].error;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[72vh] items-center">
      <Container className="text-center">
        <div className="eyebrow">{p.eyebrow}</div>
        <h1 className="text-gradient mt-4 text-4xl font-semibold tracking-tight">
          {p.title}
        </h1>
        <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
          {p.body}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-accent text-accent-contrast hover:bg-accent-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> {p.retry}
          </button>
          <Link
            href="/"
            className="text-muted hover:text-text border-border hover:border-accent/50 rounded-full border px-5 py-2.5 text-sm transition-colors"
          >
            {p.home}
          </Link>
        </div>
      </Container>
    </section>
  );
}
