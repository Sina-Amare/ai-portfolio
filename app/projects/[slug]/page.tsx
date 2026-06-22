import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { getProject, projects } from "@/lib/projects";
import { Container } from "@/components/ui/container";
import { ArchDiagram } from "@/components/projects/arch-diagram";
import { Reveal } from "@/components/motion/reveal";
import { GitHubIcon } from "@/components/icons";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.summary,
    openGraph: { title: project.name, description: project.summary },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        <Link
          href="/projects"
          className="text-muted hover:text-text inline-flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> All projects
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1fr_270px] lg:gap-16">
          {/* Main */}
          <article className="min-w-0">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="text-accent font-mono text-xs">
                  {project.year}
                </span>
                <span className="eyebrow">{project.tagline}</span>
              </div>
              <h1 className="text-gradient mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                {project.name}
              </h1>
              <p className="text-text mt-5 max-w-2xl text-lg leading-relaxed">
                {project.summary}
              </p>
            </Reveal>

            {/* Problem */}
            <Reveal delay={0.05} className="mt-12">
              <h2 className="eyebrow">The problem</h2>
              <p className="text-text mt-3 max-w-2xl leading-[1.75]">
                {project.problem}
              </p>
            </Reveal>

            {/* Role */}
            <Reveal delay={0.05} className="mt-10">
              <h2 className="eyebrow">My role</h2>
              <p className="text-text mt-3 max-w-2xl leading-[1.75]">
                {project.role}
              </p>
            </Reveal>

            {/* Architecture */}
            <Reveal delay={0.05} className="mt-10">
              <h2 className="eyebrow">How it works</h2>
              <div className="mt-4 overflow-x-auto pb-2">
                <ArchDiagram steps={project.architecture} />
              </div>
            </Reveal>

            {/* Highlights */}
            <Reveal delay={0.05} className="mt-12">
              <h2 className="eyebrow">Engineering highlights</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {project.highlights.map((h) => (
                  <div key={h.title} className="glass rounded-xl p-5">
                    <h3 className="text-sm font-semibold">{h.title}</h3>
                    <p className="text-muted mt-1.5 text-[13px] leading-relaxed">
                      {h.body}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Outcomes */}
            <Reveal delay={0.05} className="mt-12">
              <h2 className="eyebrow">Outcome</h2>
              <ul className="mt-4 space-y-2.5">
                {project.outcomes.map((o) => (
                  <li key={o} className="flex gap-2.5">
                    <Check className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                    <span className="text-text text-[15px] leading-relaxed">
                      {o}
                    </span>
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
                  <dt className="eyebrow text-[10px]">Year</dt>
                  <dd className="mt-1.5">{project.year}</dd>
                </div>
                <div>
                  <dt className="eyebrow text-[10px]">Stack</dt>
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
                <GitHubIcon className="h-4 w-4" /> View repository
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}
