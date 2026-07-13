"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FileText, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { scrollToSectionId, scrollToTop } from "@/lib/scroll";
import { useLocale } from "./locale-provider";
import { Container } from "./ui/container";
import { ThemeToggle } from "./theme-toggle";
import { LocaleToggle } from "./locale-toggle";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { t } = useLocale();

  // Every nav item targets a section of the home page, so they all glide instead
  // of jumping. "Projects" points at the #work section (which already lists every
  // project); its "All projects" button — and ⌘K — still open the /projects index.
  const links = [
    { href: "/", label: t.nav.home },
    { href: "/#work", label: t.nav.projects },
    { href: "/#about", label: t.nav.about },
    { href: "/#contact", label: t.nav.contact },
  ];

  // Same-page: intercept and scroll precisely ourselves. Cross-page (/#about from
  // another route): let the Link navigate — ScrollToHash on the home page does the
  // precise scroll once it mounts.
  const onNav = (e: React.MouseEvent, href: string) => {
    setOpen(false);

    // "Home" (and the logo) while already home: a Link to "/" would re-navigate
    // and snap to the top instantly. Glide there ourselves instead.
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      requestAnimationFrame(() => {
        scrollToTop(true);
        window.history.replaceState(null, "", "/");
      });
      return;
    }

    if (!href.startsWith("/#") || pathname !== "/") return;
    const id = href.slice(2);
    // Defer one frame so a closing mobile menu has collapsed before we measure.
    requestAnimationFrame(() => {
      if (scrollToSectionId(id, true)) {
        window.history.replaceState(null, "", href);
      }
    });
    if (document.getElementById(id)) e.preventDefault();
  };

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
            onClick={(e) => onNav(e, "/")}
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
                scroll={l.href.startsWith("/#") ? false : undefined}
                onClick={(e) => onNav(e, l.href)}
                className={cn(
                  "link-underline text-muted hover:text-text rounded-full px-3 py-1.5 text-sm transition-colors",
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
              className="text-text ms-2 inline-flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-sm transition-colors hover:border-accent/60"
            >
              <FileText className="h-3.5 w-3.5" /> {t.nav.resume}
            </a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("toggle-command"))}
              aria-label={t.nav.command}
              className="text-muted hover:text-text ms-1 hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-xs transition-colors hover:border-accent/40 lg:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              <kbd className="font-mono text-[10px] tracking-wide">⌘K</kbd>
            </button>
            <LocaleToggle className="ms-1" />
            <ThemeToggle className="ms-1" />
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <LocaleToggle />
            <ThemeToggle className="h-11 w-11" />
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
                  scroll={l.href.startsWith("/#") ? false : undefined}
                  onClick={(e) => onNav(e, l.href)}
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
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  window.dispatchEvent(new Event("toggle-command"));
                }}
                className="text-muted hover:text-text inline-flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm transition-colors"
              >
                <Search className="h-4 w-4" /> {t.nav.command}
              </button>
            </Container>
          </div>
        )}
      </div>
    </header>
  );
}
