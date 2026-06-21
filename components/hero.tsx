import { ArrowDown, ArrowUpRight, MapPin } from "lucide-react";
import { site } from "@/lib/site";
import { Container } from "./ui/container";
import { ButtonLink } from "./ui/button";
import { Portrait } from "./portrait";
import { Reveal } from "./motion/reveal";
import { GitHubIcon, LinkedInIcon } from "./icons";

const tags = ["FastAPI", "Django/DRF", "RAG", "PostgreSQL", "Docker"];

const socials = [
  { href: site.socials.github, label: "GitHub", Icon: GitHubIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div aria-hidden className="grid-texture absolute inset-0 -z-10 opacity-60" />
      <Container className="grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
        {/* Left — intro */}
        <div>
          <Reveal>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="bg-accent-2/70 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-accent-2 relative inline-flex h-2 w-2 rounded-full" />
              </span>
              <span className="eyebrow">Python backend · AI / LLM engineer</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-gradient mt-5 text-[2.6rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              Sina Amareh
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="text-muted mt-5 max-w-xl text-lg leading-relaxed">
              I build resilient backend services and LLM-powered applications —
              multi-provider RAG systems, async APIs, and secure-by-default
              tooling.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-muted rounded-full border border-border bg-white/[0.02] px-2.5 py-1 text-[11px]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/projects" size="lg">
                View projects <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="#chat" variant="outline" size="lg">
                Ask my AI <ArrowDown className="h-4 w-4" />
              </ButtonLink>
              <div className="ms-1 flex items-center gap-1.5">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-muted hover:text-text inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:border-accent/50"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="text-muted-2 mt-7 flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {site.location} · Remote ({site.timezone})
            </div>
          </Reveal>
        </div>

        {/* Right — portrait */}
        <Reveal delay={0.1} className="mx-auto w-full max-w-[360px] md:max-w-none">
          <Portrait />
        </Reveal>
      </Container>
    </section>
  );
}
