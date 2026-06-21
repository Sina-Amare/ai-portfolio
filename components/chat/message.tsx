"use client";

import { memo } from "react";
import type { UIMessage } from "ai";
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
}: {
  message: UIMessage;
  sourcesLabel: string;
}) {
  const isUser = message.role === "user";
  const text = textOf(message);
  const dir = detectDir(text);
  const sources = isUser ? [] : uniqueSourcesOf(message);

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        dir={dir}
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-2.5 text-[15px]",
          isUser
            ? "border border-accent/25 bg-accent/12 text-text"
            : "glass text-text",
          dir === "rtl" && "font-fa",
        )}
      >
        {isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap">{text}</p>
        ) : (
          <Markdown content={text} />
        )}

        {sources.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
            <span className="eyebrow text-[10px]">{sourcesLabel}</span>
            {sources.map((s) => (
              <span
                key={s}
                className="text-muted font-mono rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px]"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
