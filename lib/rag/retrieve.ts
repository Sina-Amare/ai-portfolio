import type { KBChunk, ScoredChunk } from "./types";
import { dot } from "./cosine";

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
