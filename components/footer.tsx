"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { site } from "@/lib/site";
import { useLocale } from "./locale-provider";
import { Container } from "./ui/container";
import { GitHubIcon, LinkedInIcon } from "./icons";

const socials = [
  { href: site.socials.github, key: "github", Icon: GitHubIcon },
  { href: site.socials.linkedin, key: "linkedin", Icon: LinkedInIcon },
  { href: site.socials.email, key: "email", Icon: Mail },
] as const;

export function Footer() {
  const { t, path } = useLocale();
  const year = new Date().getFullYear();
  return (
    <footer className="border-border mt-24 border-t">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <div className="text-heading font-mono text-sm font-semibold">
            sina<span className="text-accent">.</span>amareh
          </div>
          <p className="text-muted mt-3 text-sm leading-relaxed">{t.footer.tagline}</p>
          <p className="text-muted mt-4 text-xs">{t.footer.builtWith}</p>
        </div>

        <div className="flex flex-col gap-4 sm:items-end">
          <div className="flex items-center gap-2">
            {socials.map(({ href, key, Icon }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.command[key]}
                className="text-muted hover:text-text border-border hover:border-accent/50 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
          {/* The page is prerendered, so the year is build-time; the client may disagree on Jan 1. */}
          <p className="text-muted text-xs" suppressHydrationWarning>
            © {year} {site.name}. {t.footer.rights}{" "}
            <Link
              href={path("/privacy")}
              className="hover:text-text underline-offset-2 hover:underline"
            >
              {t.footer.privacy}
            </Link>
          </p>
        </div>
      </Container>
    </footer>
  );
}
