"use client";

import { ArrowRight, Lock } from "lucide-react";
import { workProjects } from "@/lib/work-projects";
import { useLocale } from "@/components/locale-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ProjectCardView } from "@/components/projects/project-card";
import { CaseStudySections } from "@/components/projects/case-study";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

/**
 * Private workplace agents. Home (`preview`): the same anatomy as Featured —
 * cards linking to /projects#<id>. /projects: a mini case study per agent,
 * with a meta sidebar instead of a repo link (the code is private).
 */
export function WorkProjects({ preview = false }: { preview?: boolean }) {
  const { locale, t } = useLocale();
  const w = t.work;

  if (preview) {
    return (
      <section id="workplace" className="scroll-mt-24 py-20 sm:py-28">
        <Container>
          <Reveal>
            <SectionHeading
              number={w.number}
              eyebrow={w.eyebrow}
              title={w.title}
              description={w.description}
            />
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2">
            {workProjects.map((p) => {
              const c = p[locale];
              return (
                <RevealItem key={p.id}>
                  <ProjectCardView
                    href={`/projects#${p.id}`}
                    label={`${c.name} — ${c.tagline}`}
                    eyebrow={w.projectLabel}
                    name={c.name}
                    tagline={c.tagline}
                    summary={c.summary}
                    stack={p.stack}
                    icon={p.icon}
                  />
                </RevealItem>
              );
            })}
          </RevealGroup>

          <Reveal delay={0.1} className="mt-8 flex justify-center">
            <ButtonLink href="/projects#workplace" variant="outline" size="md">
              {w.more} <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </ButtonLink>
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section id="workplace" className="scroll-mt-24 pt-20 pb-24 sm:pt-28">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={w.eyebrow} title={w.title} description={w.description} />
        </Reveal>

        <div className="mt-16 space-y-20">
          {workProjects.map((p) => {
            const c = p[locale];
            return (
              <article
                key={p.id}
                id={p.id}
                className="border-border grid scroll-mt-24 gap-12 border-t pt-20 first:border-t-0 first:pt-0 lg:grid-cols-[1fr_270px] lg:gap-16"
              >
                <div className="min-w-0">
                  <Reveal>
                    <div className="eyebrow">{w.projectLabel}</div>
                    <h3 className="text-gradient mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                      {c.name}
                    </h3>
                    <p className="text-text mt-5 max-w-2xl text-lg leading-relaxed">{c.summary}</p>
                  </Reveal>
                  <CaseStudySections c={c} level={4} />
                </div>

                <aside className="lg:sticky lg:top-24 lg:h-fit">
                  <GlassCard className="p-5">
                    <dl className="space-y-4 text-sm">
                      <div>
                        <dt className="eyebrow text-[10px]">{t.projects.year}</dt>
                        <dd className="mt-1.5">{p.year}</dd>
                      </div>
                      <div>
                        <dt className="eyebrow text-[10px]">{t.projects.stack}</dt>
                        <dd className="mt-2 flex flex-wrap gap-1.5">
                          {p.stack.map((s) => (
                            <span
                              key={s}
                              className="text-muted border-border rounded-full border px-2 py-0.5 font-mono text-[10px]"
                            >
                              {s}
                            </span>
                          ))}
                        </dd>
                      </div>
                    </dl>
                    <p className="text-muted border-border mt-5 flex gap-2 border-t pt-4 text-xs leading-relaxed">
                      <Lock aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {w.privateNote}
                    </p>
                  </GlassCard>
                </aside>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
