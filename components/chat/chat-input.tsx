"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  placeholder,
  dir,
  sendLabel,
  stopLabel,
  large = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isStreaming: boolean;
  placeholder: string;
  dir: "ltr" | "rtl";
  sendLabel: string;
  stopLabel: string;
  large?: boolean;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [value]);

  // Focus without the browser scrolling the input into view. On touch devices we
  // skip autofocus entirely: phones often ignore preventScroll (scrolling the
  // page down on load) and would pop the keyboard — so mobile loads at the top,
  // hero first. Desktop still gets the cursor ready in the chat.
  useEffect(() => {
    if (!autoFocus) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches) return;
    ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const btnSize = large ? "h-10 w-10" : "h-9 w-9";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className={cn("chat-input-box flex items-center gap-2", large ? "p-2.5" : "p-2")}
    >
      <textarea
        ref={ref}
        value={value}
        dir={dir}
        rows={1}
        maxLength={600}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        className={cn(
          "text-text placeholder:text-muted flex-1 resize-none bg-transparent px-2 focus:outline-none",
          large ? "max-h-44 py-2.5 text-[15px]" : "max-h-40 py-1.5 text-[15px]",
          dir === "rtl" && "font-fa",
        )}
        aria-label={placeholder}
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label={stopLabel}
          className={cn(
            "text-text inline-flex shrink-0 items-center justify-center rounded-xl border border-border-strong transition-colors hover:border-accent/60",
            btnSize,
          )}
        >
          <Square className="h-4 w-4 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label={sendLabel}
          className={cn(
            "bg-accent text-accent-contrast inline-flex shrink-0 items-center justify-center rounded-xl shadow-[0_8px_20px_-10px_var(--accent-glow)] transition-all hover:-translate-y-px hover:bg-accent-hover disabled:translate-y-0 disabled:opacity-40",
            btnSize,
          )}
        >
          <ArrowUp className="h-[18px] w-[18px]" />
        </button>
      )}
    </form>
  );
}
