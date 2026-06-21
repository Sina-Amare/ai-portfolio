import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/lib/projects";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { GitHubIcon } from "@/components/icons";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Production-minded open-source projects by Sina Amareh — where backend resilience meets LLM engineering.",
};

export default function ProjectsPage() {
  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Work"
            title="Projects"
            description="A few production-minded things I've built — each one a place where backend resilience meets LLM engineering. Tap any card for the full story."
          />
        </Reveal>

        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <RevealItem
              key={p.slug}
              className={cn(p.span === "wide" && "sm:col-span-2 lg:col-span-2")}
            >
              <ProjectCard project={p} />
            </RevealItem>
          ))}

          <RevealItem className="sm:col-span-2 lg:col-span-2">
            <a
              href={site.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass flex h-full flex-col justify-between gap-4 rounded-[var(--radius-card)] border-accent/15 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="flex items-center justify-between">
                <div className="bg-accent/15 text-accent grid h-10 w-10 place-items-center rounded-full">
                  <GitHubIcon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="text-muted group-hover:text-accent h-5 w-5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  More on GitHub
                </h3>
                <p className="text-muted mt-1 text-sm">
                  Source for everything here, plus smaller experiments.
                </p>
              </div>
            </a>
          </RevealItem>
        </RevealGroup>
      </Container>
    </section>
  );
}
