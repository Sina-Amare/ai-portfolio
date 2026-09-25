"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, Search } from "lucide-react";
import { workProjects } from "@/lib/work-projects";
import { useLocale } from "@/components/locale-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function WorkProjects({ preview = false }: { preview?: boolean }) {
  const { locale, t } = useLocale();
  const labels = t.work;
  const number = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });

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

        <div
          className={
            preview ? "mt-10 grid gap-4 lg:grid-cols-2" : "mt-10 grid gap-5"
          }
        >
          {workProjects.map((project, index) => {
            const copy = project[locale];
            const Icon = index === 0 ? Search : BarChart3;
            return (
              <div key={project.id}>
                <article className="glass border-accent/15 flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] font-normal">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <span className="bg-accent-soft text-accent border-accent/15 grid size-11 shrink-0 place-items-center rounded-xl border">
                        <Icon aria-hidden="true" className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              locale === "fa"
                                ? "text-accent font-fa text-xs font-medium"
                                : "text-accent font-mono text-[11px] tracking-wider uppercase"
                            }
                          >
                            {labels.projectLabel}
                          </span>
                          <span aria-hidden="true" className="text-muted/50">
                            /
                          </span>
                          <span
                            className={
                              locale === "fa"
                                ? "text-muted font-fa text-xs"
                                : "text-muted font-mono text-[11px]"
                            }
                          >
                            {number.format(index + 1)}
                          </span>
                        </div>
                        <h3
                          className={
                            preview
                              ? "mt-2 text-2xl font-semibold tracking-tight"
                              : "mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                          }
                        >
                          {copy.name}
                        </h3>
                        <p className="text-muted mt-1 text-sm">
                          {copy.tagline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {preview ? (
                    <div className="border-border flex flex-1 flex-col border-t px-6 py-5 sm:px-8">
                      <p className="text-text flex-1 text-sm leading-[1.8]">
                        {copy.preview}
                      </p>
                      <ul className="mt-5 flex flex-wrap gap-2">
                        {copy.highlights.map((highlight) => (
                          <li
                            key={highlight}
                            className="border-border text-muted rounded-full border px-2.5 py-1 text-xs"
                          >
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <>
                      <div className="border-border grid flex-1 border-t lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <div className="lg:border-border p-6 sm:p-8 lg:border-e">
                          <h4 className="text-accent text-sm font-semibold">
                            {labels.problem}
                          </h4>
                          <p className="text-text mt-3 text-sm leading-[1.8]">
                            {copy.problem}
                          </p>
                          <div className="bg-accent-soft border-accent/15 mt-7 rounded-xl border p-5">
                            <h4 className="text-accent text-sm font-semibold">
                              {labels.value}
                            </h4>
                            <p className="text-text mt-2 text-sm leading-[1.8]">
                              {copy.value}
                            </p>
                          </div>
                          <div className="mt-7">
                            <h4 className="text-muted text-xs font-medium">
                              {labels.highlights}
                            </h4>
                            <ul className="mt-3 flex flex-wrap gap-2">
                              {copy.highlights.map((highlight) => (
                                <li
                                  key={highlight}
                                  className="border-border text-text rounded-full border px-3 py-1.5 text-xs"
                                >
                                  {highlight}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="border-border border-t p-6 sm:p-8 lg:border-t-0">
                          <h4 className="text-accent text-sm font-semibold">
                            {labels.workflow}
                          </h4>
                          <p className="text-text mt-3 text-sm leading-[1.8]">
                            {copy.workflow}
                          </p>
                          <ol className="border-border divide-border mt-5 divide-y border-t">
                            {copy.steps.map((step, stepIndex) => (
                              <li
                                key={step.title}
                                className="flex gap-4 py-3.5"
                              >
                                <span
                                  className={
                                    locale === "fa"
                                      ? "text-accent font-fa shrink-0 pt-0.5 text-xs"
                                      : "text-accent shrink-0 pt-0.5 font-mono text-xs"
                                  }
                                >
                                  {number.format(stepIndex + 1)}
                                </span>
                                <div>
                                  <h5 className="text-heading text-sm font-semibold">
                                    {step.title}
                                  </h5>
                                  <p className="text-muted mt-1 text-sm leading-relaxed">
                                    {step.detail}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                      <div className="border-border bg-bg-2/50 border-t p-6 sm:p-8">
                        <h4 className="text-accent text-sm font-semibold">
                          {labels.decision}
                        </h4>
                        <p className="text-text mt-2 max-w-5xl text-sm leading-[1.8]">
                          {copy.decision}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="border-border flex flex-wrap gap-1.5 border-t px-6 py-4 sm:px-8">
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
              </div>
            );
          })}
        </div>

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
