import { Mail } from "lucide-react";
import { site } from "@/lib/site";
import { Container } from "./ui/container";
import { GitHubIcon, LinkedInIcon } from "./icons";

const socials = [
  { href: site.socials.github, label: "GitHub", Icon: GitHubIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: site.socials.email, label: "Email", Icon: Mail },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <div className="text-heading font-mono text-sm font-semibold">
            sina<span className="text-accent">.</span>amareh
          </div>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            {site.tagline} · {site.location} ({site.timezone}).
          </p>
          <p className="text-muted mt-4 text-xs opacity-80">
            Built with Next.js & a live multi-provider RAG assistant — the chatbot
            on this site runs on my own code.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:items-end">
          <div className="flex items-center gap-2">
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
          <p className="text-muted text-xs opacity-80">
            © {year} {site.name}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
