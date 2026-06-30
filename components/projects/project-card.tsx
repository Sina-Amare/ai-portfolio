"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { GitHubIcon } from "@/components/icons";

export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const tagline = locale === "fa" ? project.taglineFa : project.tagline;
  const summary = locale === "fa" ? project.summaryFa : project.summary;
  const repoLabel = locale === "fa" ? "سورس‌کد روی GitHub" : "Source on GitHub";

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "group glass hover:bg-card-hover relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong",
        className,
      )}
    >
      <span aria-hidden className="spotlight" />

      {/* Whole-card link to the case study (sits under the content; the GitHub
          icon re-enables pointer events above it for one-click access to code). */}
      <Link
        href={`/projects/${project.slug}`}
        aria-label={`${project.name} — ${tagline}`}
        className="absolute inset-0 z-0"
      />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        {project.cover && (
          <div className="border-border -mx-6 -mt-6 mb-5 aspect-video overflow-hidden border-b">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.cover}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow text-[10px]">{project.year}</div>
            <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{project.name}</h3>
            <p className="text-muted mt-0.5 text-[13px]">{tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.name} — ${repoLabel}`}
              title={repoLabel}
              className="text-muted hover:text-text pointer-events-auto relative z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-accent/50"
            >
              <GitHubIcon className="h-4 w-4" />
            </a>
            <ArrowUpRight className="text-muted group-hover:text-accent h-5 w-5 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>

        <p className="text-muted mt-4 flex-1 text-sm leading-relaxed">{summary}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <span
              key={s}
              className="text-muted font-mono rounded-full border border-border px-2 py-0.5 text-[10px]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
