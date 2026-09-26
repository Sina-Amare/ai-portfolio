"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import type { MediaItem } from "@/lib/projects";
import { cn } from "@/lib/utils";
import { useLocale } from "@/components/locale-provider";
import { dirOf } from "@/lib/dictionary";
import { track } from "@/lib/analytics/client";

/** Case-study screenshot / video gallery with a keyboard-navigable lightbox. */
export function MediaGallery({ items, label }: { items: MediaItem[]; label: string }) {
  const { locale, t } = useLocale();
  // In RTL "next" sits on the left: buttons, chevrons and arrow keys all mirror.
  const rtl = dirOf(locale) === "rtl";
  const captionOf = (item: MediaItem) =>
    locale === "fa" ? (item.captionFa ?? item.caption) : item.caption;
  const [index, setIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();
  const open = index !== null;
  const current = index !== null ? items[index] : null;

  // A native modal <dialog> gives the focus trap, Escape and an inert page for
  // free. Every close (button, backdrop, Escape) goes through its "close" event.
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const close = useCallback(() => dialogRef.current?.close(), []);
  const go = useCallback(
    (dir: number) => setIndex((i) => (i === null ? i : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal(); // focuses the first control: Close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      else if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, go, rtl]);

  if (!items.length) return null;

  return (
    <div>
      <h2 className="eyebrow">{label}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((m, i) => (
          <button
            key={m.src}
            type="button"
            onClick={(e) => {
              openerRef.current = e.currentTarget;
              setIndex(i);
              track("gallery_open");
            }}
            aria-label={captionOf(m) ?? t.projects.openPreview}
            className="group bg-surface border-border hover:border-accent/50 relative block aspect-video w-full overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.poster ?? m.src}
              alt={captionOf(m) ?? ""}
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
            {captionOf(m) && (
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 py-2 text-start text-[12px] text-white/90 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {captionOf(m)}
              </span>
            )}
          </button>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        aria-label={label}
        onClose={() => {
          setIndex(null);
          openerRef.current?.focus(); // back to the thumbnail that opened it
        }}
        // Only a click on the dim area itself, not on the image or a button.
        onClick={(e) => e.target === e.currentTarget && close()}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-black/85 backdrop:backdrop-blur-sm open:flex sm:p-10"
      >
        {current && (
          <>
            <button
              type="button"
              onClick={close}
              aria-label={t.projects.close}
              className="absolute end-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.projects.previous}
                  className="absolute start-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:start-6"
                >
                  <ChevronLeft className="h-6 w-6 rtl:-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.projects.next}
                  className="absolute end-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:end-6"
                >
                  <ChevronRight className="h-6 w-6 rtl:-scale-x-100" />
                </button>
              </>
            )}

            <div className="relative z-[1] w-full max-w-5xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.src}
                  initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
                  transition={{
                    duration: reduce ? 0 : 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
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
                      alt={captionOf(current) ?? ""}
                      className="mx-auto max-h-[80vh] w-full rounded-xl object-contain"
                    />
                  )}
                  {captionOf(current) && (
                    <p
                      className={cn(
                        "mt-3 text-center text-sm text-white/80",
                        items.length > 1 && "px-12",
                      )}
                    >
                      {captionOf(current)}
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
          </>
        )}
      </dialog>
    </div>
  );
}
