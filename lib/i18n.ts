export type Lang = "en" | "fa";

// Persian / Arabic Unicode blocks.
const RTL_RE = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

/** Detect text direction from content (Persian/Arabic → rtl). */
export function detectDir(text: string): "rtl" | "ltr" {
  return RTL_RE.test(text) ? "rtl" : "ltr";
}

export function isRTL(lang: Lang): boolean {
  return lang === "fa";
}

/** All viewer-facing chat strings, per language. */
export const ui = {
  en: {
    dir: "ltr",
    label: "EN",
    chatTitle: "Ask my AI assistant",
    chatSubtitle:
      "Grounded in my real CV & projects — it won't make things up.",
    placeholder: "Ask about my experience, projects, or stack…",
    send: "Send",
    stop: "Stop",
    regenerate: "Regenerate",
    newChat: "New chat",
    thinking: "Thinking…",
    you: "You",
    assistant: "Assistant",
    errorTitle: "Something went wrong.",
    errorBody: "The assistant couldn't respond. Please try again.",
    retry: "Retry",
    sources: "Sources",
    poweredBy: "Live RAG over my CV · multi-provider failover",
    suggestions: [
      "What did Sina build at Dekamond?",
      "Explain one of his RAG projects",
      "What's his strongest tech stack?",
      "Is he available for hire?",
    ],
  },
  fa: {
    dir: "rtl",
    label: "فا",
    chatTitle: "از دستیار هوش مصنوعی من بپرسید",
    chatSubtitle:
      "بر پایه‌ی رزومه و پروژه‌های واقعی من — چیزی از خودش نمی‌سازد.",
    placeholder: "درباره‌ی تجربه، پروژه‌ها یا مهارت‌هایم بپرسید…",
    send: "ارسال",
    stop: "توقف",
    regenerate: "تولید دوباره",
    newChat: "گفتگوی جدید",
    thinking: "در حال فکر کردن…",
    you: "شما",
    assistant: "دستیار",
    errorTitle: "مشکلی پیش آمد.",
    errorBody: "دستیار نتوانست پاسخ دهد. لطفاً دوباره تلاش کنید.",
    retry: "تلاش دوباره",
    sources: "منابع",
    poweredBy: "RAG زنده روی رزومه‌ی من · جابه‌جایی خودکار بین ارائه‌دهنده‌ها",
    suggestions: [
      "سینا در دکاموند چه چیزی ساخت؟",
      "یکی از پروژه‌های RAG او را توضیح بده",
      "قوی‌ترین مهارت‌های فنی او چیست؟",
      "آیا برای همکاری در دسترس است؟",
    ],
  },
} as const;

export type UIStrings = (typeof ui)[Lang];
