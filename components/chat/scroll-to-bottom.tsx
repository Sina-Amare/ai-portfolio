"use client";

import { useStickToBottomContext } from "use-stick-to-bottom";
import { ArrowDown } from "lucide-react";

/** Shows a "jump to latest" button when the transcript is scrolled up. */
export function ScrollToBottom({ label }: { label: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  if (isAtBottom) return null;
  return (
    <button
      type="button"
      onClick={() => scrollToBottom()}
      aria-label={label}
      className="glass-strong text-muted hover:text-text absolute bottom-3 left-1/2 z-10 inline-flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full shadow-md transition-colors hover:border-accent/50"
    >
      <ArrowDown className="h-4 w-4" />
    </button>
  );
}
