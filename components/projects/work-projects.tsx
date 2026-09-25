"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { workProjects } from "@/lib/work-projects";
import { useLocale } from "@/components/locale-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";

export function WorkProjects({ preview = false }: { preview?: boolean }) {
  const { locale, t } = useLocale();
  const labels = t.work;

  return (
    <section
      id="workplace"
      className={preview ? "scroll-mt-24 py-20 sm:py-28" : "scroll-mt-24 pt-20"}
    >
      <Container>
        <Reveal>
          <SectionHeading
            number={preview ? labels.number : undefined}
            eyebrow={labels.eyebrow}
            title={labels.title}
            description={labels.description}
          />
        </Reveal>

        <RevealGroup className="mt-10 grid gap-4 lg:grid-cols-2">
          {workProjects.map((project) => {
            const copy = project[locale];
            return (
              <RevealItem key={project.id}>
                <article className="glass border-accent/15 flex h-full flex-col rounded-[var(--radius-card)] p-6 sm:p-8">
                  <span className="text-accent font-mono text-[11px] tracking-wider uppercase">
                    {labels.projectLabel}
                  </span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                    {copy.name}
                  </h3>
                  <p className="text-muted mt-1 text-sm">{copy.tagline}</p>

                  {preview ? (
                    <p className="text-text mt-6 flex-1 text-sm leading-[1.8]">
                      {copy.preview}
                    </p>
                  ) : (
                    <div className="mt-7 flex-1 space-y-6">
                      {(
                        [
                          [labels.problem, copy.problem],
                          [labels.workflow, copy.workflow],
                          [labels.decision, copy.decision],
                          [labels.value, copy.value],
                        ] as const
                      ).map(([heading, body]) => (
                        <div key={heading}>
                          <h4 className="text-accent text-xs font-semibold">
                            {heading}
                          </h4>
                          <p className="text-text mt-2 text-sm leading-[1.8]">
                            {body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-border mt-7 flex flex-wrap gap-1.5 border-t pt-5">
                    {project.stack.map((item) => (
                      <span
                        key={item}
                        className="text-muted border-border rounded-full border px-2.5 py-1 font-mono text-[10px]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {preview && (
          <Reveal className="mt-8 flex justify-center">
            <Link
              href="/projects#workplace"
              className="text-text hover:text-accent inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              {labels.more} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
