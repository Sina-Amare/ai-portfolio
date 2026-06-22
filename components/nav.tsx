"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { useLocale } from "./locale-provider";
import { Container } from "./ui/container";
import { ThemeToggle } from "./theme-toggle";
import { LocaleToggle } from "./locale-toggle";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/projects", label: t.nav.projects },
    { href: "/#about", label: t.nav.about },
    { href: "/#contact", label: t.nav.contact },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "relative border-b transition-colors duration-300",
          scrolled || open ? "border-border" : "border-transparent",
        )}
      >
        <div aria-hidden className="nav-blur absolute inset-0" />
        <Container className="relative flex h-14 items-center justify-between">
          <Link
            href="/"
            className="text-heading font-mono text-sm font-semibold tracking-tight"
            aria-label="Sina Amareh — home"
          >
            sina<span className="text-accent">.</span>amareh
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-muted hover:text-text rounded-full px-3 py-1.5 text-sm transition-colors",
                  pathname === l.href && "text-text",
                )}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={site.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text ml-2 inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-sm transition-colors hover:border-accent/60"
            >
              <FileText className="h-3.5 w-3.5" /> {t.nav.resume}
            </a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("toggle-command"))}
              aria-label={t.nav.command}
              className="text-muted hover:text-text ml-1 hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-accent/40 lg:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              <kbd className="font-mono text-[10px] tracking-wide">⌘K</kbd>
            </button>
            <LocaleToggle className="ml-1" />
            <ThemeToggle className="ml-1" />
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <LocaleToggle />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-muted hover:text-text inline-flex h-11 w-11 items-center justify-center rounded-full"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        {open && (
          <div className="relative border-t border-border md:hidden">
            <Container className="flex flex-col py-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="text-muted hover:text-text rounded-lg px-2 py-2.5 text-sm transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <a
                href={site.resume}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-text mt-1 inline-flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm"
              >
                <FileText className="h-4 w-4" /> {t.nav.resume}
              </a>
            </Container>
          </div>
        )}
      </div>
    </header>
  );
}
