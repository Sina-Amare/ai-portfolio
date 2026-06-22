/**
 * In-memory caches to cut LLM load without touching accuracy:
 *  - embedCache: skip the embedding round-trip for a repeated query text.
 *  - answerCache: serve the exact same grounded answer instantly (fake-streamed)
 *    for a repeated OR semantically-equivalent first-turn question — e.g. the
 *    suggested chips and their paraphrases — with no LLM call.
 *
 * Per-instance and bounded; resets on deploy, so a knowledge-base change can't
 * go stale for long. Only used for first-turn questions, so conversation-
 * dependent follow-ups are always computed fresh.
 */
import { cosineNormalized } from "./cosine";

type Entry<T> = { value: T; at: number };

function createLRU<T>(max: number, ttlMs: number) {
  const map = new Map<string, Entry<T>>();
  return {
    get(key: string): T | undefined {
      const e = map.get(key);
      if (!e) return undefined;
      if (Date.now() - e.at > ttlMs) {
        map.delete(key);
        return undefined;
      }
      map.delete(key);
      map.set(key, e);
      return e.value;
    },
    set(key: string, value: T) {
      if (map.has(key)) map.delete(key);
      map.set(key, { value, at: Date.now() });
      if (map.size > max) {
        const oldest = map.keys().next().value;
        if (oldest !== undefined) map.delete(oldest);
      }
    },
  };
}

export const embedCache = createLRU<number[]>(500, 24 * 60 * 60 * 1000);

export type CachedAnswer = {
  text: string;
  sources: { source: string; section: string }[];
  /** Query embedding (L2-normalized) for semantic paraphrase matching. */
  embedding: number[];
};

const ANSWER_MAX = 200;
const ANSWER_TTL = 6 * 60 * 60 * 1000;
const answers = new Map<string, Entry<CachedAnswer>>();

export const answerCache = {
  get(key: string): CachedAnswer | undefined {
    const e = answers.get(key);
    if (!e) return undefined;
    if (Date.now() - e.at > ANSWER_TTL) {
      answers.delete(key);
      return undefined;
    }
    answers.delete(key);
    answers.set(key, e);
    return e.value;
  },
  set(key: string, value: CachedAnswer) {
    if (answers.has(key)) answers.delete(key);
    answers.set(key, { value, at: Date.now() });
    if (answers.size > ANSWER_MAX) {
      const oldest = answers.keys().next().value;
      if (oldest !== undefined) answers.delete(oldest);
    }
  },
  /** Empty the cache — used by tests to isolate the module-scope state. */
  clear() {
    answers.clear();
  },
  /**
   * Closest cached answer whose original query is semantically near `embedding`.
   * `keyPrefix` (e.g. "fa:") scopes the match to one language — embeddings are
   * multilingual, so a Persian question must never be served an English answer.
   */
  findSimilar(embedding: number[], threshold: number, keyPrefix?: string): CachedAnswer | undefined {
    const now = Date.now();
    let best: CachedAnswer | undefined;
    let bestSim = threshold;
    for (const [k, e] of answers) {
      if (now - e.at > ANSWER_TTL) {
        answers.delete(k);
        continue;
      }
      if (keyPrefix && !k.startsWith(keyPrefix)) continue;
      if (!e.value.embedding.length) continue;
      const sim = cosineNormalized(embedding, e.value.embedding);
      if (sim >= bestSim) {
        bestSim = sim;
        best = e.value;
      }
    }
    return best;
  },
};

export function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/\s+/g, " ").trim();
}
