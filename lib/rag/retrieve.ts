import type { UIMessage } from "ai";
import type { KBChunk, ScoredChunk } from "./types";
import { dot } from "./cosine";
import { MAX_INPUT_CHARS } from "./prompt";

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
  ["Aigram", /aigram|sakai\s?bot|[اآ]ی[\s‌]?گرام/i],
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

export function entitiesIn(text: string): string[] {
  return ALIASES.filter(([, re]) => re.test(text)).map(([name]) => name);
}

/**
 * How much of the older turn joins the query: a pasted job description one
 * turn back must not drown out the question being asked.
 */
const PREV_TURN_CHARS = 200;

/**
 * Build the retrieval query from the last up-to-two user turns, so short
 * follow-ups ("and the challenges?", "tell me more") still retrieve the right
 * context instead of embedding to nothing and getting wrongly refused.
 * When those turns name no project or employer, the newest message of the
 * last two exchanges that names exactly one leads the query ("What is Aigram?"
 * → "What stack?" → "Tests?" stays on Aigram). A message naming several is
 * skipped; anything older than two exchanges is too stale to carry.
 * Lives here, not in the route, so `npm run eval` measures the same query.
 */
export function retrievalQuery(messages: UIMessage[]): string {
  const users: number[] = []; // the last three user turns with text, newest first
  for (let i = messages.length - 1; i >= 0 && users.length < 3; i--) {
    if (messages[i].role === "user" && messageText(messages[i])) users.push(i);
  }
  if (!users.length) return "";
  const current = messageText(messages[users[0]]);
  let lead = users.length > 1 ? messageText(messages[users[1]]).slice(0, PREV_TURN_CHARS) : "";
  if (!entitiesIn(`${lead} ${current}`).length) {
    for (let i = messages.length - 1; i >= users[users.length - 1]; i--) {
      const found = entitiesIn(messageText(messages[i]));
      if (found.length === 1) {
        lead = `${found[0]} ${lead}`.trim();
        break;
      }
    }
  }
  // The route keeps the first MAX_INPUT_CHARS, so the question being asked
  // goes in whole and the older turn (and a carried name) get what's left.
  const room = MAX_INPUT_CHARS - current.length - 1;
  return lead && room > 0 ? `${lead.slice(0, room)} ${current}` : current;
}

/**
 * "Does it have tests?", "and the challenges?", «تستش چطوره؟», "Why?": a
 * question that leans on the turn before it. Anything else stands on its own,
 * even mid-chat ("What's your notice period?" after two Aigram questions).
 * ponytail: lexical cues, not a classifier. A missed cue puts the question's own
 * chunks first and gates on it alone; a false one lets the chat's reading past
 * the gate, where the prompt still keeps the model on Sina. A model-based
 * rewrite of the question is the upgrade (docs/yagni.md).
 */
const LEANS_BACK =
  /\b(?:it|its|it's|itself|this|that|these|those|they|them|their|there|then|else|more|also|too|same|differently|instead)\b|^(?:and|but|so|what about|how about)\b|(?:^|\s)(?:این|اون|همین|همون|اینو|اونو|اینا|اونا|بیشتر|دیگه)(?=[\s؟?.!،]|$)|\S{2,}ش(?:و|رو)?(?=[\s؟?.!،]|$)/iu;

export function isFollowUp(question: string): boolean {
  return question.split(/\s+/).filter(Boolean).length <= 3 || LEANS_BACK.test(question);
}

/**
 * The chunks for one chat turn, from two embeddings: the question alone and,
 * after the first turn, the conversation-aware query (`retrievalQuery`). Their
 * top chunks alternate, the conversation's first when the question leans back,
 * so "What stack did you use?" after Aigram gets Aigram's stack and "What are
 * your salary expectations?" after Aigram still gets the email pointer.
 * `score` is what the relevance gate reads: the question alone, unless it
 * leans back — two Aigram turns must not carry "What is the capital of
 * France?" over the gate. Shared with `npm run eval`, which measures this.
 */
export function rankTurn(
  chunks: KBChunk[],
  question: string,
  alone: number[],
  conversation: number[] | null,
  k: number,
): { scored: ScoredChunk[]; score: number } {
  return mergeTurn(
    question,
    retrieve(chunks, alone, k),
    conversation && retrieve(chunks, conversation, k),
    k,
  );
}

/**
 * `rankTurn`'s merge and gate reading over two finished rankings, so the lexical
 * fallback (lib/rag/lexical.ts) treats a follow-up exactly as the embeddings do.
 */
export function mergeTurn(
  question: string,
  own: ScoredChunk[],
  chat: ScoredChunk[] | null,
  k: number,
): { scored: ScoredChunk[]; score: number } {
  const top = (r: ScoredChunk[]) => r[0]?.score ?? 0;
  if (!chat) return { scored: own, score: top(own) };
  const leans = isFollowUp(question);
  const [first, second] = leans ? [chat, own] : [own, chat];
  const scored: ScoredChunk[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < k; i++) {
    for (const s of [first[i], second[i]]) {
      if (s && scored.length < k && !seen.has(s.chunk.id)) {
        seen.add(s.chunk.id);
        scored.push(s);
      }
    }
  }
  return { scored, score: leans ? Math.max(top(own), top(chat)) : top(own) };
}
