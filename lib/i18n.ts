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
    chatTitle: "Ask me anything",
    chatSubtitle:
      "An AI that answers in Sina's own voice — grounded in his real CV & projects, so no made-up answers.",
    heroHeadline: "Ask me anything about my work.",
    heroSubtitle:
      "From multi-provider RAG systems to crash-tolerant backends — ask me about anything I've built.",
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
    scrollLatest: "Jump to latest",
    copy: "Copy",
    copied: "Copied",
    poweredBy: "Live RAG over my CV · multi-provider failover",
    suggestions: [
      "What is ScrapeGPT?",
      "What can Aigram do?",
      "What did you build at Dekamond?",
      "Are you open to new roles?",
    ],
  },
  fa: {
    dir: "rtl",
    label: "فا",
    chatTitle: "از کارهام بپرس",
    chatSubtitle: "دستیار AI من با کمک رزومه و پروژه‌هام جواب می‌ده.",
    heroHeadline: "دربارهٔ کارهام ازم بپرس.",
    heroSubtitle:
      "می‌خوای بدونی چی ساختم و چطور؟ از پروژه‌ها و تجربه‌هام بپرس.",
    placeholder: "مثلاً بپرس چه پروژه‌هایی ساختم…",
    send: "ارسال",
    stop: "توقف",
    regenerate: "دوباره جواب بده",
    newChat: "گفت‌وگوی جدید",
    thinking: "دارم جواب می‌دم…",
    you: "تو",
    assistant: "من",
    errorTitle: "یه مشکلی پیش اومد.",
    errorBody: "دستیار نتونست جواب بده. لطفاً دوباره تلاش کن.",
    retry: "تلاش دوباره",
    sources: "منابع",
    scrollLatest: "برو به آخرین پیام",
    copy: "کپی",
    copied: "کپی شد",
    poweredBy: "RAG روی رزومه و پروژه‌هام · جابه‌جایی خودکار بین سرویس‌ها",
    suggestions: [
      "ScrapeGPT چیه؟",
      "ایجنت‌های کاری چه مشکلی رو حل کردن؟",
      "Aigram چه کارهایی می‌کنه؟",
      "برای کار جدید پایه‌ای؟",
    ],
  },
} as const;

export type UIStrings = (typeof ui)[Lang];
