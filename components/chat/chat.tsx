"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { StickToBottom } from "use-stick-to-bottom";
import { RefreshCcw, RotateCcw, Sparkles } from "lucide-react";
import { ui, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Message } from "./message";
import { TypingIndicator } from "./typing-indicator";
import { ChatInput } from "./chat-input";
import { Suggestions } from "./suggestions";

function LangToggle({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-border p-0.5">
      {(["en", "fa"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          aria-pressed={lang === l}
          className={cn(
            "font-mono rounded-full px-2.5 py-1 text-[11px] transition-colors",
            lang === l
              ? "bg-accent/20 text-accent-2"
              : "text-muted-2 hover:text-text",
          )}
        >
          {ui[l].label}
        </button>
      ))}
    </div>
  );
}

export function Chat() {
  const [lang, setLang] = useState<Lang>("en");
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, stop, regenerate, setMessages } =
    useChat({ transport });

  const t = ui[lang];
  const dir = t.dir as "ltr" | "rtl";
  const isStreaming = status === "submitted" || status === "streaming";
  const hasMessages = messages.length > 0;
  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant";

  function send(text: string) {
    const v = text.trim();
    if (!v || isStreaming) return;
    setInput("");
    void sendMessage({ text: v }, { body: { lang } });
  }

  return (
    <div className="glass-strong glow-accent relative mx-auto flex w-full max-w-[760px] flex-col overflow-hidden rounded-[var(--radius-card)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="bg-accent/15 text-accent-2 grid h-8 w-8 shrink-0 place-items-center rounded-full">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{t.chatTitle}</div>
            <div className="text-muted-2 truncate text-[11px]">{t.poweredBy}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {hasMessages && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setInput("");
              }}
              aria-label={t.newChat}
              title={t.newChat}
              className="text-muted-2 hover:text-text inline-flex h-8 w-8 items-center justify-center rounded-full border border-border transition-colors hover:border-accent/40"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>
          )}
          <LangToggle lang={lang} onChange={setLang} />
        </div>
      </div>

      {/* Messages */}
      <div className="relative h-[min(56vh,520px)]">
        {!hasMessages ? (
          <div
            dir={dir}
            className={cn(
              "flex h-full flex-col items-center justify-center gap-5 p-6 text-center",
              dir === "rtl" && "font-fa",
            )}
          >
            <p className="text-muted max-w-md text-sm leading-relaxed">
              {t.chatSubtitle}
            </p>
            <Suggestions items={t.suggestions} onPick={send} dir={dir} />
          </div>
        ) : (
          <StickToBottom
            className="h-full overflow-y-auto"
            resize="smooth"
            initial="smooth"
          >
            <StickToBottom.Content className="flex flex-col gap-3 p-4">
              {messages.map((m) => (
                <Message key={m.id} message={m} sourcesLabel={t.sources} />
              ))}
              {status === "submitted" && (
                <div className="flex justify-start">
                  <div className="glass rounded-2xl px-3 py-2">
                    <TypingIndicator label={t.thinking} />
                  </div>
                </div>
              )}
            </StickToBottom.Content>
          </StickToBottom>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        {hasMessages && status === "ready" && lastIsAssistant && (
          <button
            type="button"
            onClick={() => regenerate({ body: { lang } })}
            className="text-muted-2 hover:text-text mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> {t.regenerate}
          </button>
        )}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={() => send(input)}
          onStop={stop}
          isStreaming={isStreaming}
          placeholder={t.placeholder}
          dir={dir}
          sendLabel={t.send}
          stopLabel={t.stop}
        />
      </div>
    </div>
  );
}
