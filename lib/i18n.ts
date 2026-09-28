export type Lang = "en" | "fa";

// Persian / Arabic Unicode blocks. Ends at U+FEFC so a stray BOM (U+FEFF) in
// pasted text doesn't count as Persian.
const RTL_RE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFC]/;
const LATIN_RE = /[A-Za-z\u00C0-\u024F]/;

/**
 * Detect text direction from content by counting words per script, so an
 * English answer quoting «فارسی» stays LTR. Counted per word, not per letter,
 * and each Persian word counts double, because Persian questions and answers
 * carry runs of Latin tech terms ("LLM API RAG MCP رو توضیح بده").
 */
export function detectDir(text: string): "rtl" | "ltr" {
  let rtl = 0;
  let ltr = 0;
  for (const word of text.split(/\s+/)) {
    if (RTL_RE.test(word)) rtl++;
    else if (LATIN_RE.test(word)) ltr++;
  }
  return rtl > 0 && rtl * 2 >= ltr ? "rtl" : "ltr";
}

export function isRTL(lang: Lang): boolean {
  return lang === "fa";
}

// Knowledge-base source labels (scripts/embed.ts) as shown on answer chips. Project
// names stay in Latin, like everywhere else in the Persian UI. "What Sina doesn't
// claim" (content/boundaries.md) framed background answers as a list of negatives;
// renaming its H1 re-embeds every chunk of it, so for now only the chip is neutral.
const SOURCES: Record<Lang, Record<string, string>> = {
  en: { "What Sina doesn't claim": "Background at a glance" },
  fa: {
    "About Sina Amareh": "دربارهٔ سینا",
    "About this chatbot": "دربارهٔ این چت‌بات",
    "What Sina doesn't claim": "نگاهی به سوابق",
    CV: "رزومه",
    FAQ: "سؤال‌های رایج",
    "How Sina works": "روش کار سینا",
    "Skills in depth": "جزئیات مهارت‌ها",
  },
};

/** A source chip's label in the answer's language; unknown labels pass through. */
export function sourceLabel(source: string, lang: Lang): string {
  if (lang === "fa" && source.startsWith("Project: ")) {
    return `پروژه: ${source.slice("Project: ".length)}`;
  }
  return SOURCES[lang][source] ?? source;
}

/** All viewer-facing chat strings, per language. */
export const ui = {
  en: {
    dir: "ltr",
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
    errorTitle: "Something went wrong.",
    errorBody: "The assistant couldn't respond. Please try again.",
    retry: "Retry",
    sources: "Sources",
    scrollLatest: "Jump to latest",
    copy: "Copy",
    copied: "Copied",
    poweredBy: "Live RAG over my CV · multi-provider failover",
    savedNotice: "Chats are saved for 30 days to improve the assistant",
    privacy: "Privacy",
    suggestions: [
      "What is ScrapeGPT?",
      "What problems did your workplace agents solve?",
      "What can Aigram do?",
      "Are you open to new roles?",
    ],
  },
  fa: {
    dir: "rtl",
    chatTitle: "از کارهام بپرس",
    chatSubtitle: "دستیار AI من با کمک رزومه و پروژه‌هام جواب می‌ده.",
    heroHeadline: "دربارهٔ کارهام ازم بپرس.",
    heroSubtitle: "می‌خوای بدونی چی ساختم و چطور؟ از پروژه‌ها و تجربه‌هام بپرس.",
    placeholder: "مثلاً بپرس چه پروژه‌هایی ساختم…",
    send: "ارسال",
    stop: "توقف",
    regenerate: "دوباره جواب بده",
    newChat: "گفت‌وگوی جدید",
    thinking: "دارم جواب می‌دم…",
    errorTitle: "یه مشکلی پیش اومد.",
    errorBody: "دستیار نتونست جواب بده. لطفاً دوباره تلاش کن.",
    retry: "تلاش دوباره",
    sources: "منابع",
    scrollLatest: "برو به آخرین پیام",
    copy: "کپی",
    copied: "کپی شد",
    poweredBy: "RAG روی رزومه و پروژه‌هام · جابه‌جایی خودکار بین سرویس‌ها",
    savedNotice: "گفت‌وگوها ۳۰ روز نگه داشته می‌شن تا دستیار بهتر بشه",
    privacy: "حریم خصوصی",
    suggestions: [
      "ScrapeGPT چیه؟",
      "ایجنت‌های کاری چه مشکلی رو حل کردن؟",
      "Aigram چه کارهایی می‌کنه؟",
      "برای کار جدید پایه‌ای؟",
    ],
  },
} as const;

export type UIStrings = (typeof ui)[Lang];
