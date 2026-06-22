"use client";

import { ArrowRight } from "lucide-react";
import { featuredProjects } from "@/lib/projects";
import { useLocale } from "../locale-provider";
import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { ButtonLink } from "../ui/button";
import { ProjectCard } from "../projects/project-card";
import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";

export function Featured() {
  const { t } = useLocale();
  return (
    <section id="work" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            number={t.featured.number}
            eyebrow={t.featured.eyebrow}
            title={t.featured.title}
            description={t.featured.description}
          />
        </Reveal>

        <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((p) => (
            <RevealItem key={p.slug}>
              <ProjectCard project={p} />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-8 flex justify-center">
          <ButtonLink href="/projects" variant="outline" size="md">
            {t.featured.all} <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
