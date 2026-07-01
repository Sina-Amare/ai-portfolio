import type { KBChunk, ScoredChunk } from "./types";
import { dot } from "./cosine";

/**
 * How many chunks to feed the model as grounding context. The retrieval eval
 * (scripts/rag-eval.ts) proves every project's source surfaces in the top 5,
 * so 6 keeps grounding intact while trimming ~2 chunks of prompt — a smaller,
 * more focused context means a faster first token (and lower cost) on every
 * turn, especially the Persian path that leads with Gemini.
 */
export const RETRIEVAL_TOP_K = 6;

/**
 * Rank chunks against a (normalized) query embedding and return the top-k.
 * Both query and chunk embeddings are L2-normalized, so dot == cosine.
 */
export function retrieve(
  chunks: KBChunk[],
  queryEmbedding: number[],
  k = 5,
): ScoredChunk[] {
  const scored: ScoredChunk[] = chunks.map((chunk) => ({
    chunk,
    score: dot(queryEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, k));
}
