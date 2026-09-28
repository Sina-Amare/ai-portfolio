import { ui } from "@/lib/i18n";
import { normalize } from "./intent";
import { entitiesIn, mergeTurn } from "./retrieve";
import type { KBChunk, ScoredChunk } from "./types";

/**
 * Keyword retrieval (BM25) over the same chunks, for when the embedding API is
 * down: its daily quota gone, every key refused, or a timeout. No network and no
 * dependency, so the chat can still reach the answer ladder (see the route).
 */

const K1 = 1.2;
const B = 0.75;

/**
 * Words that say nothing about the topic: English function and question words,
 * Finglish ones ("Dekamond chi kar kardi?" is about Dekamond), and a few generic
 * words the notes happen to contain ("What time is it?", "What is 2 plus 2?").
 * ponytail: a word list, not semantics; `npm run eval:lexical` is its check.
 */
const STOP = new Set(
  (
    "a an the and or but of to in on at for with about from by as into onto than then " +
    "is are was were be been being am do does did doing done have has had having " +
    "i me my mine you your yours he him his she her it its we us our they them their " +
    "this that these those what whats which who whom whose where when why how " +
    "can could would should will shall may might must " +
    "any some all there here not no yes so if too very just also only " +
    "tell please time now plus minus " +
    "chi chie chiye che chera chetor chetori chikar koja ro ra ba az va ye ke ham " +
    "kar kari kardi kardin kardid mikoni mikone mikonid mikardi sakht sakhti " +
    "hast hasti hastin hastid dari dare darid mishe bood budi"
  ).split(" "),
);

const LATIN = /[a-z0-9]/;

/** "agents" → "agent", "technologies" → "technology"; the index and the query alike. */
function stem(t: string): string {
  if (!/^[a-z]+$/.test(t) || t.length < 4) return t;
  if (t.endsWith("ies")) return `${t.slice(0, -3)}y`;
  if (t.endsWith("s") && !/(?:ss|us|is)$/.test(t)) return t.slice(0, -1);
  return t;
}

/**
 * Words as the index sees them: the classifier's folding (NFKC, ZWNJ and bidi
 * marks gone, ي/ك → ی/ک, lowercase), Persian and Arabic digits as ASCII, split
 * on anything that isn't a letter or digit; stop words and single characters go.
 */
export function tokenize(text: string): string[] {
  return normalize(text)
    .replace(/[۰-۹٠-٩]/g, (d) => String(d.charCodeAt(0) % 16))
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map(stem);
}

type Index = { tf: Map<string, number>[]; len: number[]; avg: number; df: Map<string, number> };
const indexes = new WeakMap<KBChunk[], Index>();

/** Built on first use and kept for the instance's life (the chunks never change). */
function indexOf(chunks: KBChunk[]): Index {
  let ix = indexes.get(chunks);
  if (ix) return ix;
  const df = new Map<string, number>();
  const tf = chunks.map((c) => {
    const counts = new Map<string, number>();
    // The source name ("Project: Aigram", "About this chatbot") is part of the chunk.
    for (const t of tokenize(`${c.source} ${c.text}`)) counts.set(t, (counts.get(t) ?? 0) + 1);
    for (const t of counts.keys()) df.set(t, (df.get(t) ?? 0) + 1);
    return counts;
  });
  const len = tf.map((m) => [...m.values()].reduce((a, b) => a + b, 0));
  const avg = len.reduce((a, b) => a + b, 0) / Math.max(1, len.length);
  ix = { tf, len, avg, df };
  indexes.set(chunks, ix);
  return ix;
}

/**
 * The query's terms: its Latin-script words plus the canonical name of any
 * project or employer it names, in any spelling («اسکرپ», "Kaleri", "BI agents").
 * ponytail: the notes are English (two workplace-agent summaries aside, whose
 * Persian function words would make any Persian question look on-topic), so
 * Persian words are dropped: a Persian question reaches the index through the
 * Latin terms and names in it, and a Persian suggestion chip through its English
 * twin (same place in lib/i18n). A FA→EN term map is the upgrade if Persian
 * fallback recall matters.
 */
function queryTerms(query: string): string[] {
  const twin = CHIP_TWINS.get(normalize(query)) ?? "";
  const terms = new Set(tokenize(`${query} ${twin} ${entitiesIn(query).join(" ")}`));
  return [...terms].filter((t) => LATIN.test(t));
}
const CHIP_TWINS = new Map(ui.fa.suggestions.map((q, i) => [normalize(q), ui.en.suggestions[i]]));

/**
 * Chunks ranked by BM25, scored as the share of the question they cover: each
 * term's BM25 weight over its IDF, summed and divided by the question's total
 * IDF. A term the index has never seen weighs the most, so "What is the capital
 * of Japan?" scores near 0 while "What is Aigram?" covers itself. 1 ≈ every term
 * once in an average-length chunk; repeats can take it higher. Only chunks with
 * a match are returned, best first.
 */
export function lexicalRetrieve(chunks: KBChunk[], query: string, k: number): ScoredChunk[] {
  const ix = indexOf(chunks);
  const n = chunks.length;
  const idf = (t: string) => {
    const d = ix.df.get(t) ?? 0;
    return Math.log(1 + (n - d + 0.5) / (d + 0.5));
  };
  const terms = queryTerms(query).map((t) => [t, idf(t)] as const);
  const total = terms.reduce((a, [, w]) => a + w, 0);
  if (!total) return [];
  const scored: ScoredChunk[] = [];
  chunks.forEach((chunk, i) => {
    let s = 0;
    for (const [t, w] of terms) {
      const f = ix.tf[i].get(t);
      if (f) s += (w * f * (K1 + 1)) / (f + K1 * (1 - B + (B * ix.len[i]) / ix.avg));
    }
    if (s > 0) scored.push({ chunk, score: s / total });
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, Math.max(1, k));
}

/**
 * The lexical twin of `rankTurn`: the question alone and, after the first turn,
 * the conversation-aware query, merged and gated the same way.
 */
export function lexicalTurn(
  chunks: KBChunk[],
  question: string,
  conversation: string,
  k: number,
): { scored: ScoredChunk[]; score: number } {
  return mergeTurn(
    question,
    lexicalRetrieve(chunks, question, k),
    conversation === question ? null : lexicalRetrieve(chunks, conversation, k),
    k,
  );
}
