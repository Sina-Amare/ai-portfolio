"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { FileText, Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { scrollToSectionId, scrollToTop } from "@/lib/scroll";
import { useBarePath, useLocale } from "./locale-provider";
import { Container } from "./ui/container";
import { ThemeToggle } from "./theme-toggle";
import { LocaleToggle } from "./locale-toggle";

const noSubscribe = () => () => {};
const onMac = () => /Mac|iPhone|iPad/.test(navigator.platform);

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = useBarePath();
  const { t, path } = useLocale();
  // The server renders "Ctrl K" (most visitors); Macs switch to ⌘K on hydration.
  const mac = useSyncExternalStore(noSubscribe, onMac, () => false);

  // Every nav item targets a section of the home page, so they all glide instead
  // of jumping. "Projects" points at the #work section (which already lists every
  // project); its "All projects" button — and ⌘K — still open the /projects index.
  // hrefs are bare paths; path() adds the /fa prefix on Persian pages.
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
        window.history.replaceState(null, "", path("/"));
      });
      return;
    }

    if (!href.startsWith("/#") || pathname !== "/") return;
    const id = href.slice(2);
    // Defer one frame so a closing mobile menu has collapsed before we measure.
    requestAnimationFrame(() => {
      if (scrollToSectionId(id, true)) {
        window.history.replaceState(null, "", path(href));
      }
    });
    if (document.getElementById(id)) e.preventDefault();
  };

  // Escape closes the mobile menu and puts focus back on its button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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
            href={path("/")}
            onClick={(e) => onNav(e, "/")}
            className="text-heading font-mono text-sm font-semibold tracking-tight"
            aria-label={t.nav.homeLabel}
          >
            sina<span className="text-accent">.</span>amareh
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={path(l.href)}
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
              className="text-text border-border-strong hover:border-accent/60 ms-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors"
            >
              <FileText className="h-3.5 w-3.5" /> {t.nav.resume}
            </a>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("toggle-command"))}
              aria-label={t.nav.command}
              className="text-muted hover:text-text border-border hover:border-accent/40 ms-1 hidden items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors lg:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              <kbd className="font-mono text-[10px] tracking-wide">{mac ? "⌘K" : "Ctrl K"}</kbd>
            </button>
            <LocaleToggle className="ms-1" />
            <ThemeToggle className="ms-1" />
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <LocaleToggle />
            <ThemeToggle className="h-11 w-11" />
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="text-muted hover:text-text inline-flex h-11 w-11 items-center justify-center rounded-full"
              aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </Container>

        {open && (
          <div className="border-border relative border-t md:hidden">
            <Container className="flex flex-col py-3">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={path(l.href)}
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
                  // This button unmounts with the menu; move focus to the menu button
                  // first so the palette has something to hand focus back to.
                  menuButton.current?.focus();
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
