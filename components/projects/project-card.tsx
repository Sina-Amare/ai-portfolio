"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { locale } = useLocale();
  const tagline = locale === "fa" ? project.taglineFa : project.tagline;
  const summary = locale === "fa" ? project.summaryFa : project.summary;

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  return (
    <Link
      ref={ref}
      href={`/projects/${project.slug}`}
      onMouseMove={onMove}
      className={cn(
        "group glass hover:bg-card-hover relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong",
        className,
      )}
    >
      <span aria-hidden className="spotlight" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow text-[10px]">{project.year}</div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
          <p className="text-muted mt-0.5 text-[13px]">{tagline}</p>
        </div>
        <ArrowUpRight className="text-muted group-hover:text-accent h-5 w-5 shrink-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="text-muted relative mt-4 flex-1 text-sm leading-relaxed">
        {summary}
      </p>
      <div className="relative mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="text-muted font-mono rounded-full border border-border px-2 py-0.5 text-[10px]"
          >
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}
