import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

export type ChatProvider = { id: string; label: string; model: LanguageModel };

/** Each provider key env var may hold ONE key or several, comma/space separated. */
function parseKeys(name: string): string[] {
  return (process.env[name] ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// One provider instance per key, created once at module load.
const googleProviders = parseKeys("GOOGLE_GENERATIVE_AI_API_KEY").map((apiKey) =>
  createGoogleGenerativeAI({ apiKey }),
);
const openrouterProviders = parseKeys("OPENROUTER_API_KEY").map((apiKey) =>
  createOpenRouter({ apiKey }),
);

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
 * from Sina's CV). For each model, every configured key is tried before falling
 * to the next model, then to OpenRouter. Total capacity ≈ the sum of all keys.
 */
export function chatLadder(): ChatProvider[] {
  const by = rr++;
  const ladder: ChatProvider[] = [];

  // Fastest model across all Gemini keys first, then the quality model.
  for (const m of GEMINI_MODELS) {
    rotate(googleProviders, by).forEach((p, ki) =>
      ladder.push({ id: `${m.id}#${ki}`, label: m.label, model: p(m.id) }),
    );
  }
  // Free OpenRouter models across all OpenRouter keys.
  for (const m of OPENROUTER_MODELS) {
    rotate(openrouterProviders, by).forEach((p, ki) =>
      ladder.push({ id: `or:${m.id}#${ki}`, label: m.label, model: p.chat(m.id) }),
    );
  }
  return ladder;
}
