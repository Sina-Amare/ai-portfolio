import type { ScoredChunk } from "./types";

/**
 * Relevance gate (Guard 1). If the best retrieved chunk scores below this,
 * we return a deterministic refusal WITHOUT calling the LLM — structurally
 * preventing hallucination on out-of-scope questions.
 *
 * Calibrated for gemini-embedding-001 @768 with RETRIEVAL task types. The score
 * is the question's own top score (`rankTurn`: a follow-up may also use the
 * chat's). Measured by `npm run eval` (2026-09-27, 145 chunks, 109 in-scope and
 * 19 off-topic questions, of which 15 and 4 come mid-chat): in-scope
 * 0.605–0.794, off-topic 0.499–0.593, so 0.60 sits in a 0.012 gap.
 * The lowest in-scope ones are false-premise probes the KB now answers ("What
 * was your PhD thesis about?" 0.605, "Tell me about a project that failed"
 * 0.625); ordinary questions start at 0.645. The highest off-topic is "Can you
 * help me debug my Rust code?" 0.593. Raising it would refuse those probes;
 * lowering it lets coding help through. Pure small talk is answered before it
 * (intent.ts). The eval's last lines print these numbers; update this comment.
 * Override with RAG_THRESHOLD without re-embedding.
 */
export const RELEVANCE_THRESHOLD = Number(process.env.RAG_THRESHOLD ?? "0.60");

export function topScore(scored: ScoredChunk[]): number {
  return scored.length ? scored[0].score : 0;
}

export function isInScope(scored: ScoredChunk[], threshold = RELEVANCE_THRESHOLD): boolean {
  return topScore(scored) >= threshold;
}
