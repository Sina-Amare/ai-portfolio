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

/**
 * The same gate for the keyword fallback (lib/rag/lexical.ts), used only when
 * the embedding call fails. Its score is the share of the question's keywords
 * the best chunk covers (IDF-weighted), a different scale from cosine.
 * Calibrated offline by `npm run eval:lexical` (2026-09-28, 147 chunks, 111
 * in-scope and 19 off-topic golden questions; 4 off-topic ones never reach it,
 * the intent classifier answers them first): off-topic 0–0.488 (highest "What's
 * the weather today?"), the lowest in-scope above that 0.518 ("What was the
 * hardest part?" after a ScrapeGPT turn), so 0.50 sits in a 0.030 gap. 98/111
 * in-scope pass; of the 13 that don't, 9 are Persian with no Latin word or
 * project name, then «Kubernetes بلدی؟» (not in the notes), "Where are you
 * from?" (stop words only) and two follow-ups whose words match nothing. The
 * expected source is in the top 5 for 54/59.
 * tests/unit/lexical.test.ts keeps every off-topic case under it.
 */
export const LEXICAL_THRESHOLD = 0.5;

export function topScore(scored: ScoredChunk[]): number {
  return scored.length ? scored[0].score : 0;
}

export function isInScope(scored: ScoredChunk[], threshold = RELEVANCE_THRESHOLD): boolean {
  return topScore(scored) >= threshold;
}
