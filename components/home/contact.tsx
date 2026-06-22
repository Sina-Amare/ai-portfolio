"use client";

import { Mail } from "lucide-react";
import { site } from "@/lib/site";
import { useLocale } from "../locale-provider";
import { Container } from "../ui/container";
import { Reveal } from "../motion/reveal";
import { GitHubIcon, LinkedInIcon } from "../icons";
import { ContactForm } from "./contact-form";

const socials = [
  { href: site.socials.github, label: "GitHub", Icon: GitHubIcon },
  { href: site.socials.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
];

export function Contact() {
  const { t } = useLocale();
  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          {/* Left — the pitch + direct links */}
          <Reveal>
            <div>
              <span className="eyebrow">{t.contact.eyebrow}</span>
              <h2 className="text-gradient mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-[1.08]">
                {t.contact.title}
              </h2>
              <p className="text-muted mt-5 max-w-md leading-relaxed">
                {t.contact.pitch}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={site.socials.emailCompose}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-border-strong text-text hover:border-accent/60 hover:bg-accent-soft inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors"
                >
                  <Mail className="h-4 w-4" /> {site.email}
                </a>
                <div className="flex items-center gap-2">
                  {socials.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="text-muted hover:text-text border-border hover:border-accent/50 inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right — the form (delivers straight to my Telegram inbox) */}
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
