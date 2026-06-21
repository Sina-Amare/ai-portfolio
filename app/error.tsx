"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Container } from "@/components/ui/container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[72vh] items-center">
      <Container className="text-center">
        <div className="eyebrow">Something went wrong</div>
        <h1 className="text-gradient mt-4 text-4xl font-semibold tracking-tight">
          An unexpected error occurred
        </h1>
        <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
          Sorry about that. You can try again, or head back home.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-accent text-accent-contrast hover:bg-accent-hover inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
          <Link
            href="/"
            className="text-muted hover:text-text rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:border-accent/50"
          >
            Back home
          </Link>
        </div>
      </Container>
    </section>
  );
}
