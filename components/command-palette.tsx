"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { FileText, FolderGit2, Home, Mail, Moon, Sun, User } from "lucide-react";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { dirOf } from "@/lib/dictionary";
import { scrollToSectionId } from "@/lib/scroll";
import { linkEvent, track } from "@/lib/analytics/client";
import { useLocale } from "./locale-provider";
import { GitHubIcon, LinkedInIcon } from "./icons";

const itemCls =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text transition-colors data-[selected=true]:bg-accent-soft";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { locale, t, path } = useLocale();
  const dir = dirOf(locale);
  const c = t.command;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onToggle = () => setOpen((o) => !o);
    document.addEventListener("keydown", onKey);
    window.addEventListener("toggle-command", onToggle);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("toggle-command", onToggle);
    };
  }, []);

  useEffect(() => {
    if (open) track("palette_open");
  }, [open]);

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  // window.open isn't a link click, so the tracker's link listener can't see it.
  const openLink = (href: string) =>
    run(() => {
      const ev = linkEvent(href, window.location.origin);
      if (ev) track(...ev);
      window.open(href, "_blank");
    });

  // Jump to an on-page section using the precise scroller; if the section isn't
  // on this route, navigate home with the hash (ScrollToHash finishes on arrival).
  const goSection = (id: string) => () => {
    setOpen(false);
    if (scrollToSectionId(id, true)) {
      history.replaceState(null, "", path(`/#${id}`));
    } else {
      router.push(path(`/#${id}`));
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[15vh]"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div aria-hidden className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        dir={dir}
        className={cn("relative w-full max-w-[560px]", dir === "rtl" && "font-fa")}
      >
        <Command
          label={t.nav.command}
          className="glass-strong overflow-hidden rounded-2xl shadow-[0_24px_70px_-20px_rgba(0,0,0,0.6)]"
        >
          <Command.Input
            autoFocus
            placeholder={c.placeholder}
            className="text-text placeholder:text-muted border-border w-full border-b bg-transparent px-4 py-3.5 text-[15px] outline-none"
          />
          <Command.List className="max-h-[360px] overflow-auto p-2">
            <Command.Empty className="text-muted px-3 py-6 text-center text-sm">
              {c.empty}
            </Command.Empty>

            <Command.Group heading={c.groupNav}>
              <Command.Item className={itemCls} onSelect={run(() => router.push(path("/")))}>
                <Home className="h-4 w-4" /> {c.home}
              </Command.Item>
              <Command.Item
                className={itemCls}
                onSelect={run(() => router.push(path("/projects")))}
              >
                <FolderGit2 className="h-4 w-4" /> {c.projects}
              </Command.Item>
              <Command.Item className={itemCls} onSelect={goSection("about")}>
                <User className="h-4 w-4" /> {c.about}
              </Command.Item>
              <Command.Item className={itemCls} onSelect={goSection("contact")}>
                <Mail className="h-4 w-4" /> {c.contact}
              </Command.Item>
            </Command.Group>

            <Command.Group heading={c.groupLinks}>
              <Command.Item className={itemCls} onSelect={openLink(site.resume)}>
                <FileText className="h-4 w-4" /> {c.resume}
              </Command.Item>
              <Command.Item className={itemCls} onSelect={openLink(site.socials.github)}>
                <GitHubIcon className="h-4 w-4" /> {c.github}
              </Command.Item>
              <Command.Item className={itemCls} onSelect={openLink(site.socials.linkedin)}>
                <LinkedInIcon className="h-4 w-4" /> {c.linkedin}
              </Command.Item>
              <Command.Item className={itemCls} onSelect={openLink(site.socials.emailCompose)}>
                <Mail className="h-4 w-4" /> {c.email}
              </Command.Item>
            </Command.Group>

            <Command.Group heading={c.groupTheme}>
              <Command.Item
                className={itemCls}
                onSelect={run(() => setTheme(resolvedTheme === "dark" ? "light" : "dark"))}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}{" "}
                {c.toggleTheme}
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
