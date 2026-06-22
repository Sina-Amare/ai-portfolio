"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import type { Project } from "@/lib/projects";
import { useLocale } from "@/components/locale-provider";
import { Container } from "@/components/ui/container";
import { ArchDiagram } from "@/components/projects/arch-diagram";
import { Reveal } from "@/components/motion/reveal";
import { GitHubIcon } from "@/components/icons";

/**
 * Case-study body. Structural labels are localized; the deep technical prose
 * (problem, role, highlights, architecture) stays in English by design.
 */
export function CaseStudy({ project }: { project: Project }) {
  const { locale, t } = useLocale();
  const p = t.projects;
  const tagline = locale === "fa" ? project.taglineFa : project.tagline;
  const summary = locale === "fa" ? project.summaryFa : project.summary;

  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        <Link
          href="/projects"
          className="text-muted hover:text-text inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {p.back}
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_270px] lg:gap-16">
          {/* Main */}
          <article className="min-w-0">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="text-accent font-mono text-xs">{project.year}</span>
                <span className="eyebrow">{tagline}</span>
              </div>
              <h1 className="text-gradient mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                {project.name}
              </h1>
              <p className="text-text mt-5 max-w-2xl text-lg leading-relaxed">{summary}</p>
            </Reveal>

            <Reveal delay={0.05} className="mt-12">
              <h2 className="eyebrow">{p.problem}</h2>
              <p className="text-text mt-3 max-w-2xl leading-[1.75]">{project.problem}</p>
            </Reveal>

            <Reveal delay={0.05} className="mt-10">
              <h2 className="eyebrow">{p.myRole}</h2>
              <p className="text-text mt-3 max-w-2xl leading-[1.75]">{project.role}</p>
            </Reveal>

            <Reveal delay={0.05} className="mt-10">
              <h2 className="eyebrow">{p.howItWorks}</h2>
              <div className="mt-4 overflow-x-auto pb-2">
                <ArchDiagram steps={project.architecture} />
              </div>
            </Reveal>

            <Reveal delay={0.05} className="mt-12">
              <h2 className="eyebrow">{p.highlights}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {project.highlights.map((h) => (
                  <div key={h.title} className="glass rounded-xl p-5">
                    <h3 className="text-sm font-semibold">{h.title}</h3>
                    <p className="text-muted mt-1.5 text-[13px] leading-relaxed">{h.body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.05} className="mt-12">
              <h2 className="eyebrow">{p.outcomes}</h2>
              <ul className="mt-4 space-y-2.5">
                {project.outcomes.map((o) => (
                  <li key={o} className="flex gap-2.5">
                    <Check className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-text text-[15px] leading-relaxed">{o}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </article>

          {/* Sticky meta sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="glass rounded-[var(--radius-card)] p-5">
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="eyebrow text-[10px]">{p.year}</dt>
                  <dd className="mt-1.5">{project.year}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-[10px]">{p.stack}</dt>
                  <dd className="mt-2 flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-muted rounded-full border border-border px-2 py-0.5 text-[10px]"
                      >
                        {s}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-sm transition-colors hover:border-accent/60"
              >
                <GitHubIcon className="h-4 w-4" /> {p.viewRepo}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
