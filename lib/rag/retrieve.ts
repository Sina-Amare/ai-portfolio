import type { UIMessage } from "ai";
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
export function retrieve(chunks: KBChunk[], queryEmbedding: number[], k = 5): ScoredChunk[] {
  const scored: ScoredChunk[] = chunks.map((chunk) => ({
    chunk,
    score: dot(queryEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, k));
}

/** A chat turn's text parts, joined. */
export function messageText(m: UIMessage): string {
  return (m.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
}

/**
 * What a follow-up can point back to ("does it have tests?"): each project or
 * employer with the spellings visitors and answers use, Persian included.
 */
const ALIASES: [string, RegExp][] = [
  ["ScrapeGPT", /scrape\s?gpt|اسکرپ/i],
  ["Aigram", /aigram|sakai\s?bot|ای[\s‌]?گرام/i],
  ["RubricEval", /rubric\s?eval|github[\s-]code[\s-]review|روبریک/i],
  ["PromptAmp", /prompt\s?amp|پرامپت[\s‌]?امپ/i],
  [
    "Business Intelligence Agents",
    /business intelligence agents?|\bbi agents?\b|ایجنت[\s‌]?(?:های[\s‌]?)?(?:تحلیل|مالی)/i,
  ],
  ["Social Research Agent", /social research agent|ایجنت[\s‌]?رصد/i],
  ["Dekamond", /dekamond|kaleri|دکاموند/i],
  ["Arnikup", /arnikup|آرنیکاپ/i],
  ["Mercor", /mercor|مرکور/i],
];

function entitiesIn(text: string): string[] {
  return ALIASES.filter(([, re]) => re.test(text)).map(([name]) => name);
}

/**
 * Build the retrieval query from the last up-to-two user turns, so short
 * follow-ups ("and the challenges?", "tell me more") still retrieve the right
 * context instead of embedding to nothing and getting wrongly refused.
 * When those turns name no project or employer, the last one the chat was
 * about leads the query ("What is Aigram?" → "What stack?" → "Tests?" stays
 * on Aigram). A reply naming several is ambiguous, so nothing is carried.
 * Lives here, not in the route, so `npm run eval` measures the same query.
 */
export function retrievalQuery(messages: UIMessage[]): string {
  const turns: string[] = [];
  for (let i = messages.length - 1; i >= 0 && turns.length < 2; i--) {
    if (messages[i].role !== "user") continue;
    const t = messageText(messages[i]);
    if (t) turns.unshift(t);
  }
  const query = turns.join(" ");
  if (entitiesIn(query).length) return query;
  for (let i = messages.length - 1; i >= 0; i--) {
    const found = entitiesIn(messageText(messages[i]));
    // Leads the query, so the route's MAX_INPUT_CHARS cut (it drops the end) keeps it.
    if (found.length) return found.length === 1 ? `${found[0]} ${query}` : query;
  }
  return query;
}
