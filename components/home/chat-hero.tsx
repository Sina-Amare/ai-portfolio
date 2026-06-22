"use client";

import { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RefreshCcw, RotateCcw } from "lucide-react";
import { ui, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";
import { Container } from "@/components/ui/container";
import { Avatar } from "@/components/avatar";
import { Message } from "@/components/chat/message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { ChatInput } from "@/components/chat/chat-input";
import { Suggestions } from "@/components/chat/suggestions";
import { LangToggle } from "@/components/chat/lang-toggle";
import { Transcript } from "@/components/chat/transcript";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ChatHero() {
  const [lang, setLang] = useState<Lang>("en");
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );
  const { messages, sendMessage, status, stop, regenerate, setMessages } =
    useChat({ transport });
  const reduce = useReducedMotion();

  const t = ui[lang];
  const dir = t.dir as "ltr" | "rtl";
  const isStreaming = status === "submitted" || status === "streaming";
  const active = messages.length > 0;
  const lastIsAssistant = messages[messages.length - 1]?.role === "assistant";

  function send(text: string) {
    const v = text.trim();
    if (!v || isStreaming) return;
    // Activating the chat collapses the headline and reflows the hero; pin the
    // view to the top so the conversation stays framed instead of jumping away.
    if (messages.length === 0 && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setInput("");
    void sendMessage({ text: v }, { body: { lang } });
  }

  function reset() {
    setMessages([]);
    setInput("");
  }

  const eyebrow =
    dir === "rtl"
      ? "بک‌اند پایتون · مهندس هوش مصنوعی"
      : "Python backend · AI / LLM engineer";

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="hero-bg pointer-events-none absolute inset-0 -z-10" />
      <Container className="flex min-h-[92svh] flex-col items-center justify-start pt-24 pb-16 sm:justify-center sm:py-24">
        {/* Identity */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mb-7 flex items-center gap-2.5"
        >
          <Avatar size={34} status />
          <span className="text-text text-sm font-medium">{site.name}</span>
          <span className="text-muted inline-flex items-center gap-1.5 font-mono text-[11px]">
            <span className="bg-accent inline-block h-1.5 w-1.5 rounded-full" />
            available
          </span>
        </motion.div>

        {/* Headline — collapses on first message */}
        <AnimatePresence initial={false}>
          {!active && (
            <motion.div
              key="headline"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -12, height: 0, marginBottom: 0 }
              }
              transition={{ duration: 0.34, ease: EASE }}
              className="mb-9 flex flex-col items-center overflow-hidden text-center"
              dir={dir}
            >
              <span className={cn("eyebrow mb-4", dir === "rtl" && "font-fa")}>
                {eyebrow}
              </span>
              <h1
                className={cn(
                  "text-gradient max-w-2xl text-[2.4rem] leading-[1.04] font-semibold tracking-tight text-balance sm:text-[3.3rem]",
                  dir === "rtl" && "font-fa",
                )}
              >
                {t.heroHeadline}
              </h1>
              <p
                className={cn(
                  "text-muted mt-5 max-w-xl text-base leading-relaxed text-pretty sm:text-[17px]",
                  dir === "rtl" && "font-fa",
                )}
              >
                {t.heroSubtitle}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat column */}
        {active ? (
          <div
            className="flex w-full max-w-[720px] flex-col"
            style={{ height: "min(74svh, 760px)" }}
          >
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <button
                type="button"
                onClick={reset}
                className="text-muted hover:text-text inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:border-accent/40"
              >
                <RefreshCcw className="h-3.5 w-3.5" /> {t.newChat}
              </button>
              <LangToggle lang={lang} onChange={setLang} />
            </div>

            <Transcript scrollLabel={t.scrollLatest}>
              {messages.map((m) => (
                <Message
                  key={m.id}
                  message={m}
                  sourcesLabel={t.sources}
                  copyLabel={t.copy}
                  copiedLabel={t.copied}
                />
              ))}
              {status === "submitted" && (
                <div className="text-muted flex justify-start px-1">
                  <TypingIndicator label={t.thinking} />
                </div>
              )}
            </Transcript>

            {status === "error" && (
              <div
                dir={dir}
                role="alert"
                className={cn(
                  "mt-3 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm",
                  dir === "rtl" && "font-fa",
                )}
              >
                <span className="text-red-500">{t.errorTitle}</span>
                <button
                  type="button"
                  onClick={() => regenerate({ body: { lang } })}
                  className="text-text shrink-0 font-medium underline-offset-2 hover:underline"
                >
                  {t.retry}
                </button>
              </div>
            )}

            <div className="mt-3 shrink-0">
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
                large
                autoFocus
              />
              {status === "ready" && lastIsAssistant && (
                <div className="mt-2 flex">
                  <button
                    type="button"
                    onClick={() => regenerate({ body: { lang } })}
                    className="text-muted hover:text-text inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" /> {t.regenerate}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[720px]">
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
              large
            />
            <div className="mt-5 flex flex-col items-center gap-4">
              <Suggestions items={t.suggestions} onPick={send} dir={dir} />
              <LangToggle lang={lang} onChange={setLang} />
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
