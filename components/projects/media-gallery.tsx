"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { MediaItem } from "@/lib/projects";
import { cn } from "@/lib/utils";

/** Case-study screenshot / video gallery with a keyboard-navigable lightbox. */
export function MediaGallery({ items, label }: { items: MediaItem[]; label: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const open = index !== null;
  const current = index !== null ? items[index] : null;

  const close = useCallback(() => setIndex(null), []);
  const go = useCallback(
    (dir: number) =>
      setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close, go]);

  if (!items.length) return null;

  return (
    <div>
      <h2 className="eyebrow">{label}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((m, i) => (
          <button
            key={m.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={m.caption ?? "Open preview"}
            className="group bg-surface border-border hover:border-accent/50 relative block aspect-video w-full overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.poster ?? m.src}
              alt={m.caption ?? ""}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {m.type === "video" && (
              <span className="absolute inset-0 grid place-items-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </span>
            )}
            {m.caption && (
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-start text-[12px] text-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                {m.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && current && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label={label}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous"
                  className="absolute left-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next"
                  className="absolute right-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            <div
              className="relative z-[1] w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.src}
                  initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                  transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                  {current.type === "video" ? (
                    <video
                      src={current.src}
                      poster={current.poster}
                      controls
                      autoPlay
                      className="mx-auto max-h-[80vh] w-full rounded-xl"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={current.src}
                      alt={current.caption ?? ""}
                      className="mx-auto max-h-[80vh] w-full rounded-xl object-contain"
                    />
                  )}
                  {current.caption && (
                    <p
                      className={cn(
                        "mt-3 text-center text-sm text-white/80",
                        items.length > 1 && "px-12",
                      )}
                    >
                      {current.caption}
                      {items.length > 1 && (
                        <span className="text-white/40">
                          {" "}
                          · {index! + 1}/{items.length}
                        </span>
                      )}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
