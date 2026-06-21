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
      </div>
    </div>
  );
});
