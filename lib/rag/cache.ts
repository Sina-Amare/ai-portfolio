/**
 * In-memory caches to cut perceived latency without touching accuracy:
 *  - embedCache: skip the embedding round-trip for a repeated query text.
 *  - answerCache: serve the exact same grounded answer instantly (fake-streamed)
 *    for repeated single-turn questions — e.g. the suggested-question chips.
 *
 * Per-instance and bounded; resets on deploy, so a knowledge-base change can't
 * go stale for long. The answer cache is only used for first-turn questions, so
 * conversation-dependent follow-ups are always computed fresh.
 */
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
      // refresh recency
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

export type CachedAnswer = {
  text: string;
  sources: { source: string; section: string }[];
};

export const embedCache = createLRU<number[]>(500, 24 * 60 * 60 * 1000);
export const answerCache = createLRU<CachedAnswer>(200, 6 * 60 * 60 * 1000);

export function normalizeQuery(q: string): string {
  return q.toLowerCase().replace(/\s+/g, " ").trim();
}
