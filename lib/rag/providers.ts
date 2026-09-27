import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";
import type { Lang } from "@/lib/i18n";

export type ChatProvider = { id: string; label: string; model: LanguageModel };

/** Each provider key env var may hold ONE key or several, comma/space separated. */
function parseKeys(name: string): string[] {
  return (process.env[name] ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// One provider instance per key, created once at module load.
const groqProviders = parseKeys("GROQ_API_KEY").map((apiKey) => createGroq({ apiKey }));
const googleProviders = parseKeys("GOOGLE_GENERATIVE_AI_API_KEY").map((apiKey) =>
  createGoogleGenerativeAI({ apiKey }),
);
const openrouterProviders = parseKeys("OPENROUTER_API_KEY").map((apiKey) =>
  createOpenRouter({ apiKey }),
);

// The chatbot describes this ladder to visitors: update content/chatbot.md when it changes.
// Groq's LPU gives the fastest time-to-first-token, so it leads the ladder when
// a key is configured. Falls through to Gemini → OpenRouter on rate limit.
const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B · Groq" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B · Groq" },
];
const GEMINI_MODELS = [
  // 3.1 Flash-Lite leads: noticeably better Persian than 2.5 (verified against
  // the production prompt on an EN+FA battery). Google closed 2.5 Flash / Flash-Lite
  // to projects created after mid-2026 (404 "no longer available to new users" on the
  // new production key, 2026-09-27), so the backups are 3.5 Flash-Lite and 3.6 Flash:
  // both answered a Persian probe in colloquial Persian with a first token in ~2.5 s at
  // thinkingLevel "minimal". 3.5 Flash was skipped (503s, and 28 s to first token).
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite" },
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
];
// Picked 2026-09-27 on an EN+FA battery with the real prompt (the old Qwen3 Next and
// Llama 3.3 `:free` slugs 404; Gemma 4 and Qwen3.8 were rate-limited upstream all day).
// Ultra wrote the only colloquial Persian, so Persian tries it first. It streams at about
// 8 tokens/s (one English answer took 50 s, the route's whole deadline), so English tries
// Super first: grounded English, streams far faster (a Persian answer in 3 s), but formal
// Persian. Reasoning off: with it on, Ultra's first Persian token took 18 s.
const NEMOTRON_ULTRA = {
  id: "nvidia/nemotron-3-ultra-550b-a55b:free",
  label: "Nemotron 3 Ultra · OpenRouter",
};
const NEMOTRON_SUPER = {
  id: "nvidia/nemotron-3-super-120b-a12b:free",
  label: "Nemotron 3 Super · OpenRouter",
};
const OPENROUTER_MODELS: Record<Lang, { id: string; label: string }[]> = {
  en: [NEMOTRON_SUPER, NEMOTRON_ULTRA],
  fa: [NEMOTRON_ULTRA, NEMOTRON_SUPER],
};

// Round-robin offset so load spreads across keys instead of always hammering the
// first one — it raises the effective per-minute ceiling, and the failover loop
// in the route then covers a key that's fully exhausted for the day.
let rr = 0;
/**
 * Rotated [item, original index] pairs. The original index goes into the rung id,
 * so an id names the same key on every request (the route's 429 cooldown relies on it).
 */
function rotate<T>(arr: T[], by: number): [T, number][] {
  return arr.map((_, i) => {
    const k = (i + by) % arr.length;
    return [arr[k]!, k];
  });
}

/**
 * Ordered failover ladder (the multi-provider + multi-key resilience pattern
 * from Sina's CV). Each model is tried across every configured key before
 * falling to the next; total capacity ≈ the sum of all keys.
 *
 * The order is language-aware: Llama (Groq) is fast but weak at Persian, while
 * Gemini handles Persian well. So Persian leads with Gemini and keeps Groq as a
 * last resort; English leads with Groq for the fastest first-token.
 */
export function chatLadder(lang: Lang = "en"): ChatProvider[] {
  const by = rr++;

  const groq: ChatProvider[] = [];
  for (const m of GROQ_MODELS) {
    rotate(groqProviders, by).forEach(([p, k]) =>
      groq.push({ id: `groq:${m.id}#${k}`, label: m.label, model: p(m.id) }),
    );
  }
  const gemini: ChatProvider[] = [];
  for (const m of GEMINI_MODELS) {
    rotate(googleProviders, by).forEach(([p, k]) =>
      gemini.push({ id: `${m.id}#${k}`, label: m.label, model: p(m.id) }),
    );
  }
  const openrouter: ChatProvider[] = [];
  for (const m of OPENROUTER_MODELS[lang]) {
    rotate(openrouterProviders, by).forEach(([p, k]) =>
      openrouter.push({
        id: `or:${m.id}#${k}`,
        label: m.label,
        model: p.chat(m.id, { reasoning: { effort: "none" } }),
      }),
    );
  }

  return lang === "fa"
    ? [...gemini, ...openrouter, ...groq] // Persian: quality first, Groq last
    : [...groq, ...gemini, ...openrouter]; // English: fastest first-token first
}
