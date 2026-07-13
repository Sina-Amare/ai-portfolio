"use client";

import { ArrowUpRight, FileText } from "lucide-react";
import { site } from "@/lib/site";
import { useLocale } from "../locale-provider";
import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { ButtonLink } from "../ui/button";
import { Reveal } from "../motion/reveal";

// Skill tags stay in Latin in both languages — that's how engineers read them.
const stackItems = {
  ai: [
    "RAG",
    "LangGraph",
    "Multi-provider failover",
    "Prompt design",
    "Token budgeting",
    "LLM evaluation",
  ],
  backend: ["FastAPI", "Django/DRF", "Async APIs", "Celery", "JWT"],
  infra: ["PostgreSQL", "Redis", "Docker", "SQLAlchemy/Alembic", "Linux"],
} as const;

export function About() {
  const { t } = useLocale();
  const a = t.about;
  const stackGroups = [
    { label: a.stackLabel.ai, items: stackItems.ai },
    { label: a.stackLabel.backend, items: stackItems.backend },
    { label: a.stackLabel.infra, items: stackItems.infra },
  ];

  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading number={a.number} eyebrow={a.eyebrow} title={a.title} />
        </Reveal>

        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
          {/* Left: bio + strengths + quote + stack */}
          <Reveal>
            <p className="text-text text-base leading-[1.85]">{a.bio}</p>

            <div className="mt-8">
              <div className="eyebrow text-[10px]">{a.strengthsLabel}</div>
              <ul className="mt-3 space-y-2">
                {a.strengths.map((s) => (
                  <li
                    key={s}
                    className="text-text relative ps-4 text-[14px] leading-relaxed before:absolute before:top-2.5 before:size-1.5 before:rounded-full before:bg-accent before:content-[''] before:inset-s-0"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <figure className="border-accent/40 mt-8 border-s-2 ps-4">
              <blockquote className="text-text text-sm leading-relaxed">
                &ldquo;{a.quote}&rdquo;
              </blockquote>
              <figcaption className="text-muted mt-2 text-xs">{a.quoteBy}</figcaption>
            </figure>

            <div className="mt-8 space-y-5">
              {stackGroups.map((g) => (
                <div key={g.label}>
                  <div className="eyebrow text-[10px]">{g.label}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.items.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-muted rounded-full border border-border px-2.5 py-1 text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={site.resume} external variant="outline" size="md">
                <FileText className="h-4 w-4" /> {t.nav.resume}
              </ButtonLink>
              <ButtonLink
                href={site.socials.emailCompose}
                external
                variant="ghost"
                size="md"
              >
                {site.email} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Reveal>

          {/* Right: experience + education + recognition */}
          <Reveal delay={0.1}>
            <div className="eyebrow text-[10px]">{a.experienceLabel}</div>
            <div className="mt-4 space-y-6">
              {a.experience.map((e) => (
                <div key={e.org} className="border-s border-border ps-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium">
                      {e.role} <span className="text-accent">· {e.org}</span>
                    </h3>
                    <span className="text-muted font-mono shrink-0 text-[11px]">
                      {e.period}
                    </span>
                  </div>
                  <p className="text-muted mt-1.5 text-[13px] leading-relaxed">{e.note}</p>
                </div>
              ))}
            </div>

            <div className="eyebrow mt-8 text-[10px]">{a.educationLabel}</div>
            <div className="mt-4 space-y-4">
              {a.education.map((e) => (
                <div key={e.degree} className="border-s border-border ps-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium">{e.degree}</h3>
                    <span className="text-muted font-mono shrink-0 text-[11px]">
                      {e.period}
                    </span>
                  </div>
                  <p className="text-muted mt-1 text-[13px]">{e.org}</p>
                </div>
              ))}
            </div>

            <div className="eyebrow mt-8 text-[10px]">{a.recognitionLabel}</div>
            <ul className="mt-4 space-y-2 text-[13px] leading-relaxed">
              {a.recognition.map((r) => (
                <li key={r} className="text-muted">
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
