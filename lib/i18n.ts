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
      "What can SakaiBot do?",
      "What did you build at Dekamond?",
      "Are you open to new roles?",
    ],
  },
  fa: {
    dir: "rtl",
    label: "فا",
    chatTitle: "هرچی دوست داری از من بپرس",
    chatSubtitle:
      "یه هوش مصنوعی که از زبون خودِ سینا جواب می‌ده — بر پایهٔ رزومه و پروژه‌های واقعیش.",
    heroHeadline: "هرچی دوست داری از کارهام بپرس.",
    heroSubtitle:
      "از سیستم‌های RAG چند-ارائه‌دهنده تا بک‌اندهای مقاوم در برابر خرابی — دربارهٔ هر چیزی که ساختم بپرس.",
    placeholder: "از تجربه، پروژه‌ها یا مهارت‌هام بپرس…",
    send: "ارسال",
    stop: "توقف",
    regenerate: "دوباره بساز",
    newChat: "گفت‌وگوی جدید",
    thinking: "دارم فکر می‌کنم…",
    you: "شما",
    assistant: "دستیار",
    errorTitle: "یه مشکلی پیش اومد.",
    errorBody: "دستیار نتونست جواب بده. لطفاً دوباره تلاش کن.",
    retry: "تلاش دوباره",
    sources: "منابع",
    scrollLatest: "رفتن به آخرین پیام",
    copy: "کپی",
    copied: "کپی شد",
    poweredBy: "RAG زنده روی رزومهٔ من · جابه‌جایی خودکار بین ارائه‌دهنده‌ها",
    suggestions: [
      "ScrapeGPT چیه؟",
      "ساکای‌بات چیکار می‌کنه؟",
      "تو دکاموند چی ساختی؟",
      "برای کار جدید پایه‌ای؟",
    ],
  },
} as const;

export type UIStrings = (typeof ui)[Lang];
