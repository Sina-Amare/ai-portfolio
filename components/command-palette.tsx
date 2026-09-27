"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics/client";

// cmdk (~15 KB gz) loads on the first open, not with every page.
const CommandPaletteBody = lazy(() =>
  import("./command-palette-body").then((m) => ({ default: m.CommandPaletteBody })),
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
    // The dialog handles Escape and outside clicks itself; Escape here only
    // matters while cmdk is still loading.
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape") {
        setOpen(false);
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

  const close = () => setOpen(false);
  // Mounted only while open: closing unmounts the dialog, as Radix does anyway.
  // On the first open, the dialog's backdrop (same classes) shows at once, so
  // ⌘K doesn't look dead on a slow network; a click on it cancels, as it will
  // once the dialog is there.
  return open ? (
    <Suspense
      fallback={
        <div
          data-palette-loading
          onClick={close}
          className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
        />
      }
    >
      <CommandPaletteBody onClose={close} />
    </Suspense>
  ) : null;
}
