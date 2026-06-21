import type { ScoredChunk } from "./types";

/**
 * Relevance gate (Guard 1). If the best retrieved chunk scores below this,
 * we return a deterministic refusal WITHOUT calling the LLM — structurally
 * preventing hallucination on out-of-scope questions.
 *
 * Calibrated for gemini-embedding-001 @768 with RETRIEVAL task types:
 * empirically, in-scope queries score ~0.68–0.79 and out-of-scope ~0.49–0.58,
 * so 0.62 sits cleanly in the gap. Override with RAG_THRESHOLD without re-embedding.
 */
export const RELEVANCE_THRESHOLD = Number(process.env.RAG_THRESHOLD ?? "0.62");

export function topScore(scored: ScoredChunk[]): number {
  return scored.length ? scored[0].score : 0;
}

export function isInScope(
  scored: ScoredChunk[],
  threshold = RELEVANCE_THRESHOLD,
): boolean {
  return topScore(scored) >= threshold;
}
