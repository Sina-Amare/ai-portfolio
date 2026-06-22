"use client";

import { useEffect } from "react";
import { scrollToSectionId } from "@/lib/scroll";

/**
 * Home-page only: when the page is reached with a #hash — a cross-page nav like
 * /projects → /#about, or a direct/shared link — scroll precisely to that
 * section once the sections have laid out. This is what makes those nav links
 * land correctly on the FIRST click (the browser's native hash scroll fired
 * before the home sections existed, hence the old "click twice").
 */
export function ScrollToHash() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    // Two frames so the chat hero has laid out before we measure; the utility's
    // own re-snap then corrects any remaining settle.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => scrollToSectionId(id, false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return null;
}
