"use client";

import { memo, useState } from "react";
import type { UIMessage } from "ai";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectDir } from "@/lib/i18n";
import { Markdown } from "./markdown";

type TextPart = { type: "text"; text: string };
type SourcesPart = { type: "data-sources"; data: { source: string; section: string }[] };

function textOf(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((p): p is TextPart => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function uniqueSourcesOf(message: UIMessage): string[] {
  const part = (message.parts ?? []).find(
    (p): p is SourcesPart => p.type === "data-sources",
  );
  const list = Array.isArray(part?.data) ? part.data : [];
  return [...new Set(list.map((s) => s.source))];
}

export const Message = memo(function Message({
  message,
  sourcesLabel,
  copyLabel = "Copy",
  copiedLabel = "Copied",
}: {
  message: UIMessage;
  sourcesLabel: string;
  copyLabel?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const text = textOf(message);
  const dir = detectDir(text);
  const sources = isUser ? [] : uniqueSourcesOf(message);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={cn("group flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        dir={dir}
        className={cn(
          "text-[15px] leading-relaxed",
          isUser
            ? "text-text max-w-[85%] rounded-2xl border border-border bg-surface px-4 py-2.5"
            : "text-text max-w-full",
          dir === "rtl" && "font-fa",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <Markdown content={text} />
        )}

        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="eyebrow text-[10px]">{sourcesLabel}</span>
            {sources.map((s) => (
              <span
                key={s}
                className="text-muted font-mono rounded-full border border-border px-2 py-0.5 text-[10px]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {!isUser && text && (
          <button
            type="button"
            onClick={copy}
            aria-label={copied ? copiedLabel : copyLabel}
            className="text-muted hover:text-text mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-70"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" /> {copiedLabel}
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" /> {copyLabel}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
