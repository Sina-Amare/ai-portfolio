"use client";

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

/** The open palette; `CommandPalette` loads it on first use and owns open state and focus. */
export function CommandPaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const { locale, t, path } = useLocale();
  const dir = dirOf(locale);
  const c = t.command;

  const run = (fn: () => void) => () => {
    onClose();
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
    onClose();
    if (scrollToSectionId(id, true)) {
      history.replaceState(null, "", path(`/#${id}`));
    } else {
      router.push(path(`/#${id}`));
    }
  };

  // cmdk's Radix dialog: focus trap, Escape, outside click, inert page, ARIA.
  return (
    <Command.Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      label={t.nav.command}
      dir={dir}
      overlayClassName="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
      contentClassName="fixed inset-x-4 top-[15vh] z-[70] mx-auto max-w-[560px]"
      className={cn(
        "glass-strong overflow-hidden rounded-2xl shadow-[0_24px_70px_-20px_rgba(0,0,0,0.6)]",
        dir === "rtl" && "font-fa",
      )}
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
          <Command.Item className={itemCls} onSelect={run(() => router.push(path("/projects")))}>
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
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}{" "}
            {c.toggleTheme}
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
