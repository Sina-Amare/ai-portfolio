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

// Groq's LPU gives the fastest time-to-first-token, so it leads the ladder when
// a key is configured. Falls through to Gemini → OpenRouter on rate limit.
const GROQ_MODELS = [
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B · Groq" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B · Groq" },
];
const GEMINI_MODELS = [
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
];
const OPENROUTER_MODELS = [
  { id: "qwen/qwen3-next-80b-a3b-instruct:free", label: "Qwen3 Next 80B · OpenRouter" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B · OpenRouter" },
];

// Round-robin offset so load spreads across keys instead of always hammering the
// first one — it raises the effective per-minute ceiling, and the failover loop
// in the route then covers a key that's fully exhausted for the day.
let rr = 0;
function rotate<T>(arr: T[], by: number): T[] {
  return arr.length ? arr.map((_, i) => arr[(i + by) % arr.length]!) : arr;
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
    rotate(groqProviders, by).forEach((p, ki) =>
      groq.push({ id: `groq:${m.id}#${ki}`, label: m.label, model: p(m.id) }),
    );
  }
  const gemini: ChatProvider[] = [];
  for (const m of GEMINI_MODELS) {
    rotate(googleProviders, by).forEach((p, ki) =>
      gemini.push({ id: `${m.id}#${ki}`, label: m.label, model: p(m.id) }),
    );
  }
  const openrouter: ChatProvider[] = [];
  for (const m of OPENROUTER_MODELS) {
    rotate(openrouterProviders, by).forEach((p, ki) =>
      openrouter.push({ id: `or:${m.id}#${ki}`, label: m.label, model: p.chat(m.id) }),
    );
  }

  return lang === "fa"
    ? [...gemini, ...openrouter, ...groq] // Persian: quality first, Groq last
    : [...groq, ...gemini, ...openrouter]; // English: fastest first-token first
}
