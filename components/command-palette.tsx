"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { track } from "@/lib/analytics/client";

// cmdk (~15 KB gz) loads on the first open, not with every page.
const CommandPaletteBody = dynamic(
  () => import("./command-palette-body").then((m) => m.CommandPaletteBody),
  { ssr: false },
);

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  // Radix only hands focus back to a Dialog.Trigger; this opens from ⌘K and two
  // nav buttons, so remember what had focus (never an element inside the palette).
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const toggle = () => {
      // A native modal <dialog> (the gallery lightbox) sits in the top layer and
      // makes the rest of the page inert: the palette would open unseen and
      // unreachable, and Radix's body pointer-events:none would freeze the lightbox.
      if (document.querySelector("dialog[open]")) return;
      const el = document.activeElement;
      if (el instanceof HTMLElement && !el.closest("[cmdk-dialog]")) returnTo.current = el;
      setOpen((o) => !o);
    };
    // Escape and outside clicks are handled by the dialog itself.
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("toggle-command", toggle);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("toggle-command", toggle);
    };
  }, []);

  useEffect(() => {
    if (open) {
      track("palette_open");
    } else {
      // preventScroll: a command may just have scrolled to a section.
      returnTo.current?.focus({ preventScroll: true });
      returnTo.current = null;
    }
  }, [open]);

  // Mounted only while open: closing unmounts the dialog, as Radix does anyway.
  return open ? <CommandPaletteBody onClose={() => setOpen(false)} /> : null;
}
