import { Mail } from "lucide-react";
import { site } from "@/lib/site";
import { Container } from "../ui/container";
import { ButtonLink } from "../ui/button";
import { Reveal } from "../motion/reveal";
import { GitHubIcon, LinkedInIcon } from "../icons";

const socials = [
  { href: site.socials.github, label: "GitHub", Icon: GitHubIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
];

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="glass relative overflow-hidden rounded-[var(--radius-card)] px-6 py-12 text-center sm:px-12 sm:py-16">
            <span
              aria-hidden
              className="hero-bg pointer-events-none absolute inset-0 -z-10 opacity-60"
            />
            <span className="eyebrow">Get in touch</span>
            <h2 className="text-gradient mx-auto mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
              Let&rsquo;s build something together
            </h2>
            <p className="text-muted mx-auto mt-4 max-w-md leading-relaxed">
              I&rsquo;m open to backend &amp; AI engineering roles and interesting
              collaborations. The fastest way to reach me is email — I&rsquo;ll get
              back to you.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={site.socials.email} external size="lg">
                <Mail className="h-4 w-4" /> {site.email}
              </ButtonLink>
              <div className="flex items-center gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-muted hover:text-text inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:border-accent/50"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
