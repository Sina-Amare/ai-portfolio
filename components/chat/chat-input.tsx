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
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow up to a cap.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="glass-strong flex items-end gap-2 rounded-2xl border border-border p-2 transition-colors focus-within:border-accent/50"
    >
      <textarea
        ref={ref}
        value={value}
        dir={dir}
        rows={1}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        className={cn(
          "text-text placeholder:text-muted-2 max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-[15px] focus:outline-none",
          dir === "rtl" && "font-fa",
        )}
        aria-label={placeholder}
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          aria-label={stopLabel}
          className="text-text inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-strong transition-colors hover:border-accent/60"
        >
          <Square className="h-4 w-4 fill-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label={sendLabel}
          className="bg-accent inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-[0_8px_24px_-10px_var(--accent-glow)] transition-all hover:bg-accent-2 disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
