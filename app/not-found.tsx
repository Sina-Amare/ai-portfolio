"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useLocale } from "@/components/locale-provider";
import { pageCopy } from "@/lib/page-copy";

export default function NotFound() {
  const { locale } = useLocale();
  const p = pageCopy[locale].notFound;
  return (
    <section className="flex min-h-[72vh] items-center">
      <Container className="text-center">
        <div className="eyebrow">{p.eyebrow}</div>
        <h1 className="text-gradient mt-4 text-5xl font-semibold tracking-tight">
          {p.title}
        </h1>
        <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
          {p.body}
        </p>
        <Link
          href="/"
          className="bg-accent text-accent-contrast hover:bg-accent-hover mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {p.home}
        </Link>
      </Container>
    </section>
  );
}
