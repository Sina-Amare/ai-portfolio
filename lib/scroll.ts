/**
 * Precise in-page scrolling to a section, robust against the two things that
 * made nav links need a second click:
 *
 *  1. <Reveal> wraps section content in a motion.div that animates translateY,
 *     so getBoundingClientRect() reads a *moving* position. We measure offsetTop
 *     instead — a pure layout value, immune to transforms.
 *  2. The chat hero (and any late layout) can settle *after* the scroll starts,
 *     shifting the target. We re-snap once the scroll ends so the landing is
 *     exact on the FIRST click.
 */

/** Document-Y where the section's content should sit, just under the fixed nav. */
function sectionTop(el: HTMLElement): number {
  const target = (el.firstElementChild as HTMLElement | null) ?? el;
  let y = 0;
  for (let n: HTMLElement | null = target; n; n = n.offsetParent as HTMLElement | null) {
    y += n.offsetTop;
  }
  const navH = document.querySelector("header")?.getBoundingClientRect().height ?? 56;
  return Math.max(0, y - navH - 16);
}

/**
 * Scroll so section `id` lands just below the nav. Returns false if the section
 * isn't in the DOM (e.g. navigating from another page — the caller lets the
 * route change and ScrollToHash finishes the job on arrival).
 */
export function scrollToSectionId(id: string, smooth = true): boolean {
  const el = document.getElementById(id);
  if (!el) return false;

  window.scrollTo({ top: sectionTop(el), behavior: smooth ? "smooth" : "auto" });

  // Re-snap once the scroll settles, in case layout shifted underneath it.
  let settled = false;
  const snap = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener("scrollend", snap);
    const want = sectionTop(el);
    const delta = Math.abs(window.scrollY - want);
    // Correct a small layout shift; ignore a large delta (the user scrolled away).
    if (delta > 2 && delta < 600) window.scrollTo({ top: want, behavior: "auto" });
  };
  window.addEventListener("scrollend", snap, { once: true });
  window.setTimeout(snap, smooth ? 800 : 250); // fallback if scrollend is unsupported
  return true;
}
