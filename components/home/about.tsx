import { ArrowUpRight, FileText } from "lucide-react";
import { site } from "@/lib/site";
import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { ButtonLink } from "../ui/button";
import { Reveal } from "../motion/reveal";

const experience = [
  {
    role: "Software Developer",
    org: "Dekamond",
    period: "2025 · 6 months",
    note: "AI & automation for Kaleri.ai; multi-provider LLM workflows (LangGraph, RAG) behind FastAPI. Cut LLM running costs ~70%.",
  },
  {
    role: "Django Developer (Backend)",
    org: "Arnikup",
    period: "2024 · 6 months",
    note: "REST APIs for a food-delivery platform; Django REST Framework, PostgreSQL, Redis, Celery, Docker.",
  },
];

const education = [
  {
    degree: "M.Sc., Software Engineering",
    org: "Islamic Azad University — Science & Research, Tehran",
    period: "2025 – present",
  },
  {
    degree: "B.Sc., Computer Science",
    org: "University of Guilan, Rasht",
    period: "2020 – 2024",
  },
];

const stackGroups = [
  { label: "LLM & AI", items: ["RAG", "LangGraph", "Multi-provider failover", "Prompt design", "Token budgeting"] },
  { label: "Backend", items: ["FastAPI", "Django/DRF", "Async APIs", "Celery", "JWT"] },
  { label: "Data & Infra", items: ["PostgreSQL", "Redis", "Docker", "SQLAlchemy/Alembic", "Linux"] },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            number="02"
            eyebrow="About"
            title="A bit about me"
          />
        </Reveal>

        <div className="mt-10 grid gap-12 md:grid-cols-[1fr_1fr] md:gap-16">
          {/* Left: bio + stack */}
          <Reveal>
            <p className="text-text text-base leading-[1.75]">
              I&rsquo;m a Python developer with a Computer Science degree and
              around a year of professional experience, focused on backend
              services and LLM-powered applications. I learn mainly by building —
              my open-source projects are where ideas get tested and pushed
              toward production quality. I&rsquo;m early in my career and still
              growing, but steady about shipping, writing tests, and seeing work
              through.
            </p>

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
                <FileText className="h-4 w-4" /> Résumé
              </ButtonLink>
              <ButtonLink href={site.socials.email} external variant="ghost" size="md">
                {site.email} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Reveal>

          {/* Right: experience + education */}
          <Reveal delay={0.1}>
            <div className="eyebrow text-[10px]">Experience</div>
            <div className="mt-4 space-y-6">
              {experience.map((e) => (
                <div key={e.org} className="border-s border-border ps-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium">
                      {e.role}{" "}
                      <span className="text-accent">· {e.org}</span>
                    </h3>
                    <span className="text-muted font-mono shrink-0 text-[11px]">
                      {e.period}
                    </span>
                  </div>
                  <p className="text-muted mt-1.5 text-[13px] leading-relaxed">
                    {e.note}
                  </p>
                </div>
              ))}
            </div>

            <div className="eyebrow mt-8 text-[10px]">Education</div>
            <div className="mt-4 space-y-4">
              {education.map((e) => (
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

            <div className="eyebrow mt-8 text-[10px]">Recognition &amp; languages</div>
            <ul className="mt-4 space-y-2 text-[13px] leading-relaxed">
              <li className="text-muted">
                <span className="text-text font-medium">2nd place</span> — team
                Python programming competition, University of Guilan (2023)
              </li>
              <li className="text-muted">
                Undergraduate research on Particle Swarm Optimization
              </li>
              <li className="text-muted">
                English (professional working proficiency) · Persian (native)
              </li>
            </ul>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
