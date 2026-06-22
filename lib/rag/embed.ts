import { l2normalize } from "./cosine";

/** Embedding model identity — stored in kb.json and asserted at runtime. */
export const EMBED = { model: "gemini-embedding-001", dim: 768, version: 1 } as const;

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type EmbedTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/** GOOGLE_GENERATIVE_AI_API_KEY may hold one key or several (comma/space sep). */
function googleKeys(): string[] {
  return (process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "")
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Round-robin offset so embeddings spread across keys (helps the per-minute
// rate limit at build time and under load).
let embRR = 0;

/**
 * Embed a single text with Gemini and L2-normalize the result. Rotates across
 * all configured keys and retries the next key on a rate-limit / transient
 * error, so one exhausted key doesn't break retrieval.
 */
export async function embedText(
  text: string,
  task: EmbedTask,
  signal?: AbortSignal,
): Promise<number[]> {
  const keys = googleKeys();
  if (!keys.length) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

  const start = embRR++;
  let lastErr: unknown;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[(start + i) % keys.length]!;
    try {
      const res = await fetch(`${BASE}/models/${EMBED.model}:embedContent?key=${key}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: `models/${EMBED.model}`,
          content: { parts: [{ text }] },
          outputDimensionality: EMBED.dim,
          taskType: task,
        }),
        signal,
      });

      // Rate-limited / transient on this key → try the next one.
      if (res.status === 429 || res.status === 503) {
        lastErr = new Error(`Embedding rate-limited (${res.status})`);
        continue;
      }
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`Embedding request failed (${res.status}): ${detail.slice(0, 200)}`);
      }

      const json = (await res.json()) as { embedding?: { values?: number[] } };
      const values = json.embedding?.values;
      if (!values || values.length === 0) throw new Error("Embedding response had no values");
      return l2normalize(values);
    } catch (err) {
      if (signal?.aborted) throw err;
      lastErr = err;
    }
  }

  throw lastErr ?? new Error("Embedding failed across all keys");
}
