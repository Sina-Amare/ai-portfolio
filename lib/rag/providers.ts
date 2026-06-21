import { google } from "@ai-sdk/google";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { LanguageModel } from "ai";

export type ChatProvider = { id: string; label: string; model: LanguageModel };

const openrouter = process.env.OPENROUTER_API_KEY
  ? createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
  : null;

/**
 * Ordered failover ladder (the same multi-provider resilience pattern from Sina's CV).
 * Gemini first (fast first-token, reliable), then free OpenRouter models as fallback.
 * Only providers with a configured key are included.
 */
export function chatLadder(): ChatProvider[] {
  const ladder: ChatProvider[] = [];

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    ladder.push({
      id: "gemini-2.5-flash",
      label: "Gemini 2.5 Flash",
      model: google("gemini-2.5-flash"),
    });
    ladder.push({
      id: "gemini-2.5-flash-lite",
      label: "Gemini 2.5 Flash-Lite",
      model: google("gemini-2.5-flash-lite"),
    });
  }

  if (openrouter) {
    ladder.push({
      id: "or-qwen3-next-80b",
      label: "Qwen3 Next 80B · OpenRouter",
      model: openrouter.chat("qwen/qwen3-next-80b-a3b-instruct:free"),
    });
    ladder.push({
      id: "or-llama-3.3-70b",
      label: "Llama 3.3 70B · OpenRouter",
      model: openrouter.chat("meta-llama/llama-3.3-70b-instruct:free"),
    });
  }

  return ladder;
}
