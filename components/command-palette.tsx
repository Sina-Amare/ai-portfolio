"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { useTheme } from "next-themes";
import { FileText, FolderGit2, Home, Mail, Moon, Sun, User } from "lucide-react";
import { site } from "@/lib/site";
import { GitHubIcon, LinkedInIcon } from "./icons";

const itemCls =
  "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-text transition-colors data-[selected=true]:bg-accent-soft";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

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

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[15vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
      role="presentation"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[560px]">
        <Command
          label="Command menu"
          className="glass-strong overflow-hidden rounded-2xl shadow-[0_24px_70px_-20px_rgba(0,0,0,0.6)]"
        >
          <Command.Input
            autoFocus
            placeholder="Type a command or search…"
            className="text-text placeholder:text-muted w-full border-b border-border bg-transparent px-4 py-3.5 text-[15px] outline-none"
          />
          <Command.List className="max-h-[360px] overflow-auto p-2">
            <Command.Empty className="text-muted px-3 py-6 text-center text-sm">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation">
              <Command.Item className={itemCls} onSelect={run(() => router.push("/"))}>
                <Home className="h-4 w-4" /> Home
              </Command.Item>
              <Command.Item
                className={itemCls}
                onSelect={run(() => router.push("/projects"))}
              >
                <FolderGit2 className="h-4 w-4" /> Projects
              </Command.Item>
              <Command.Item
                className={itemCls}
                onSelect={run(() => router.push("/#about"))}
              >
                <User className="h-4 w-4" /> About
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Links">
              <Command.Item
                className={itemCls}
                onSelect={run(() => window.open(site.resume, "_blank"))}
              >
                <FileText className="h-4 w-4" /> Résumé
              </Command.Item>
              <Command.Item
                className={itemCls}
                onSelect={run(() => window.open(site.socials.github, "_blank"))}
              >
                <GitHubIcon className="h-4 w-4" /> GitHub
              </Command.Item>
              <Command.Item
                className={itemCls}
                onSelect={run(() => window.open(site.socials.linkedin, "_blank"))}
              >
                <LinkedInIcon className="h-4 w-4" /> LinkedIn
              </Command.Item>
              <Command.Item
                className={itemCls}
                onSelect={run(() => window.location.assign(site.socials.email))}
              >
                <Mail className="h-4 w-4" /> Email me
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Theme">
              <Command.Item
                className={itemCls}
                onSelect={run(() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark"),
                )}
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}{" "}
                Toggle theme
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
