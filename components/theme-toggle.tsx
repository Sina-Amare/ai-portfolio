"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";

/**
 * Theme toggle. Icon visibility is driven by `[data-theme]` CSS (set by
 * next-themes before hydration), so there's no mount flicker or hydration gap.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useLocale();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={t.command.toggleTheme}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={cn(
        "text-muted hover:text-text border-border hover:border-accent/50 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors",
        className,
      )}
    >
      <Sun className="theme-icon-dark h-[18px] w-[18px]" />
      <Moon className="theme-icon-light h-[18px] w-[18px]" />
    </button>
  );
}
