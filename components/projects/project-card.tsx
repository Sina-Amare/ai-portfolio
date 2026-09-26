"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { GitHubIcon } from "@/components/icons";

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const { locale, path } = useLocale();
  const tagline = locale === "fa" ? project.taglineFa : project.tagline;
  return (
    <ProjectCardView
      href={path(`/projects/${project.slug}`)}
      label={`${project.name} — ${tagline}`}
      eyebrow={project.year}
      name={project.name}
      tagline={tagline}
      summary={locale === "fa" ? project.summaryFa : project.summary}
      stack={project.stack}
      cover={project.cover}
      repo={project.repo}
      className={className}
    />
  );
}

/** The site's project card: whole-card link, spotlight, lift. Plain props so
 *  non-`Project` entries (the workplace agents) render identically. */
export function ProjectCardView({
  href,
  label,
  eyebrow,
  name,
  tagline,
  summary,
  stack,
  cover,
  repo,
  icon: Icon,
  className,
}: {
  href: string;
  /** Accessible name of the whole-card link. */
  label: string;
  eyebrow: string;
  name: string;
  tagline: string;
  summary: string;
  stack: string[];
  cover?: string;
  /** GitHub button only when set. */
  repo?: string;
  /** Shown when there is no cover. */
  icon?: LucideIcon;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLocale();
  const repoLabel = t.projects.sourceOnGithub;

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
        "group glass hover:bg-card-hover hover:border-border-strong relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 transition-all duration-200 hover:-translate-y-0.5",
        // The link's own focus ring is clipped by overflow-hidden and covered by
        // the content layer, so the card draws it (an outline isn't clipped).
        "has-[>a:focus-visible]:outline-accent has-[>a:focus-visible]:outline-2 has-[>a:focus-visible]:outline-offset-2",
        className,
      )}
    >
      <span aria-hidden className="spotlight" />

      {/* Whole-card link (sits under the content; the GitHub icon re-enables
          pointer events above it for one-click access to code). */}
      <Link href={href} aria-label={label} className="absolute inset-0 z-0" />

      <div className="pointer-events-none relative z-10 flex flex-1 flex-col">
        {cover && (
          <div className="border-border -mx-6 -mt-6 mb-5 aspect-video overflow-hidden border-b">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div>
            {Icon && !cover && (
              <div className="bg-accent/15 text-accent mb-4 grid h-10 w-10 place-items-center rounded-full">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
            )}
            <div className="eyebrow">{eyebrow}</div>
            <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{name}</h3>
            <p className="text-muted mt-0.5 text-[13px]">{tagline}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {repo && (
              <a
                href={repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} — ${repoLabel}`}
                title={repoLabel}
                className="text-muted hover:text-text border-border hover:border-accent/50 pointer-events-auto relative z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              >
                <GitHubIcon className="h-4 w-4" />
              </a>
            )}
            <ArrowUpRight className="text-muted group-hover:text-accent h-5 w-5 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
          </div>
        </div>

        <p className="text-muted mt-4 flex-1 text-sm leading-relaxed">{summary}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {stack.map((s) => (
            <span
              key={s}
              className="text-muted border-border rounded-full border px-2 py-0.5 font-mono text-[10px]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
