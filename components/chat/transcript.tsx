"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

/**
 * A reliable chat transcript:
 * - messages stick to the BOTTOM (short answers sit just above the input — no gap),
 * - auto-scrolls as content streams in (via ResizeObserver), but only while the
 *   user is already near the bottom, so scrolling up to read history isn't yanked back,
 * - shows a "jump to latest" button when scrolled up.
 *
 * The scroll container is a normal block element (not flex) so overflowing content
 * never clips at the top; an inner `min-h-full justify-end` wrapper bottom-anchors
 * short content without breaking scroll.
 */
export function Transcript({
  children,
  scrollLabel,
}: {
  children: React.ReactNode;
  scrollLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const c = containerRef.current;
    const content = contentRef.current;
    if (!c || !content) return;

    const update = () => {
      const near = c.scrollHeight - c.scrollTop - c.clientHeight < 64;
      stick.current = near;
      setAtBottom(near);
    };

    const ro = new ResizeObserver(() => {
      if (stick.current) c.scrollTop = c.scrollHeight;
    });
    ro.observe(content);
    c.addEventListener("scroll", update, { passive: true });
    c.scrollTop = c.scrollHeight;

    return () => {
      ro.disconnect();
      c.removeEventListener("scroll", update);
    };
  }, []);

  function toBottom() {
    const c = containerRef.current;
    if (!c) return;
    c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
    stick.current = true;
    setAtBottom(true);
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={containerRef}
        className="transcript-mask h-full overflow-y-auto overscroll-auto"
      >
        <div className="flex min-h-full flex-col justify-end">
          <div
            ref={contentRef}
            role="log"
            aria-live="polite"
            aria-atomic="false"
            className="flex flex-col gap-5 px-0.5 py-2"
          >
            {children}
          </div>
        </div>
      </div>

      {!atBottom && (
        <button
          type="button"
          onClick={toBottom}
          aria-label={scrollLabel}
          className="glass-strong text-muted hover:text-text absolute bottom-3 left-1/2 z-10 inline-flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full shadow-md transition-colors hover:border-accent/50"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
