"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Container } from "./ui/container";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/#about", label: "About" },
  { href: "/#chat", label: "Ask AI" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass-strong border-b border-border">
        <Container className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="font-mono text-sm font-semibold tracking-tight"
            aria-label="Sina Amareh — home"
          >
            sina<span className="text-accent-2">.</span>amareh
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
              <FileText className="h-3.5 w-3.5" /> Résumé
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-muted hover:text-text -mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </Container>

        {open && (
          <div className="border-t border-border md:hidden">
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
                <FileText className="h-4 w-4" /> Résumé
              </a>
            </Container>
          </div>
        )}
      </div>
    </header>
  );
}
