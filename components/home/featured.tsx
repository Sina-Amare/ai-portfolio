import { ArrowRight } from "lucide-react";
import { featuredProjects } from "@/lib/projects";
import { Container } from "../ui/container";
import { SectionHeading } from "../ui/section-heading";
import { ButtonLink } from "../ui/button";
import { ProjectCard } from "../projects/project-card";
import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";

export function Featured() {
  return (
    <section id="work" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            number="02"
            eyebrow="Selected work"
            title="Things I've built"
            description="Production-minded open-source projects where backend resilience meets LLM engineering."
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
            All projects <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </Reveal>
      </Container>
    </section>
  );
}
