"use client";

import { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

// Memoized so only the streaming message re-parses; safe (no raw HTML).
const components: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent-text hover:text-accent underline underline-offset-2"
    >
      {children}
    </a>
  ),
  p: ({ children }) => (
    <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>
  ),
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1 ps-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1 ps-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="text-text font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="mt-3 mb-1 text-base font-semibold">{children}</h3>,
  h2: ({ children }) => <h3 className="mt-3 mb-1 text-base font-semibold">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-2 mb-1 text-sm font-semibold">{children}</h4>,
  code: ({ className, children }) => {
    const isBlock = (className ?? "").includes("language-");
    if (isBlock) {
      return <code className="font-mono text-[0.85em]">{children}</code>;
    }
    return (
      <code className="text-accent-text bg-accent-soft font-mono rounded px-1.5 py-0.5 text-[0.85em]">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-border bg-black/40 p-3 text-[0.85em]">
      {children}
    </pre>
  ),
};

export const Markdown = memo(function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
});
