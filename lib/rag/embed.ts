import { l2normalize } from "./cosine";

/** Embedding model identity — stored in kb.json and asserted at runtime. */
export const EMBED = { model: "gemini-embedding-001", dim: 768, version: 1 } as const;

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type EmbedTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

/**
 * Embed a single text with Gemini and L2-normalize the result.
 * Used at build time (RETRIEVAL_DOCUMENT) and at request time (RETRIEVAL_QUERY).
 */
export async function embedText(
  text: string,
  task: EmbedTask,
  signal?: AbortSignal,
): Promise<number[]> {
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

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

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Embedding request failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const json = (await res.json()) as { embedding?: { values?: number[] } };
  const values = json.embedding?.values;
  if (!values || values.length === 0) throw new Error("Embedding response had no values");
  return l2normalize(values);
}
