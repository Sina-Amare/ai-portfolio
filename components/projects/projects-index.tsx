"use client";

import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { GitHubIcon } from "@/components/icons";

export function ProjectsIndex() {
  const { t } = useLocale();
  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t.projects.eyebrow}
            title={t.projects.title}
            description={t.projects.description}
          />
        </Reveal>

        {/* Bento: at lg the two "wide" projects each take 2 of 3 columns and pair
            with a narrow cell, so the grid tiles exactly — and the GitHub link,
            which is only a footnote, stays the smallest card rather than the
            biggest. Below lg everything is one column wide (a clean 2×2 on sm),
            since a 2-col span there would leave holes. */}
        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <RevealItem key={p.slug} className={cn(p.span === "wide" && "lg:col-span-2")}>
              <ProjectCard project={p} />
            </RevealItem>
          ))}

          <RevealItem>
            <a
              href={site.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass flex h-full flex-col justify-center gap-4 rounded-[var(--radius-card)] border-accent/15 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40"
            >
              {/* Centred, not top/bottom-anchored: this tile stretches to the
                  height of the tall project card beside it, and pinning the icon
                  and text to opposite edges left a big empty gap down the middle. */}
              <div className="flex items-center justify-between">
                <div className="bg-accent/15 text-accent grid h-10 w-10 place-items-center rounded-full">
                  <GitHubIcon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="text-muted group-hover:text-accent h-5 w-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {t.projects.moreOnGithub}
                </h3>
                <p className="text-muted mt-1 text-sm">{t.projects.moreOnGithubNote}</p>
              </div>
            </a>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
