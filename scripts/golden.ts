/**
 * The golden set (eval/golden.json) as the chat route sees it, shared by
 * `npm run eval` (embeddings) and the offline lexical run (`npm run eval:lexical`
 * and tests/unit/lexical.test.ts): no network here.
 */
import type { UIMessage } from "ai";
import { classifyIntent } from "../lib/rag/intent";
import { lexicalTurn } from "../lib/rag/lexical";
import { sanitizeInput } from "../lib/rag/prompt";
import { retrievalQuery } from "../lib/rag/retrieve";
import type { KBChunk } from "../lib/rag/types";

export type Turn = { role: "user" | "assistant"; text: string };
export type Golden = {
  inScope: { q: string; expectSource?: string; history?: Turn[] }[];
  outOfScope: (string | { q: string; history: Turn[] })[];
};

/** The two texts the route retrieves with: the question alone and the conversation-aware query. */
export function turnQueries(q: string, history: Turn[] = []) {
  const messages: UIMessage[] = [...history, { role: "user" as const, text: q }].map((t, i) => ({
    id: String(i),
    role: t.role,
    parts: [{ type: "text", text: t.role === "user" ? sanitizeInput(t.text) : t.text.trim() }],
  }));
  const question = sanitizeInput(q);
  return { question, conversation: sanitizeInput(retrievalQuery(messages)) || question };
}

export type LexicalRow = {
  label: string;
  inScope: boolean;
  /** The lexical gate's reading; 0 when the classifier answered first. */
  score: number;
  /** The intent classifier's canned reply, which comes before retrieval. */
  intent?: string;
  expectSource?: string;
  /** Top-k sources, best first. */
  sources: string[];
};

/** Every golden case through the classifier, then the lexical fallback, as the route runs them. */
export function lexicalEval(chunks: KBChunk[], golden: Golden, k = 5): LexicalRow[] {
  type Case = { q: string; history?: Turn[]; expectSource?: string; inScope: boolean };
  const cases: Case[] = [
    ...golden.inScope.map((c) => ({ ...c, inScope: true })),
    ...golden.outOfScope.map((c) => ({
      ...(typeof c === "string" ? { q: c } : c),
      inScope: false,
    })),
  ];
  return cases.map(({ q, history, inScope, expectSource }) => {
    const label = history ? `${q}  ⟵ ${history.length} earlier turns` : q;
    const { question, conversation } = turnQueries(q, history);
    const intent = classifyIntent(question, !!history?.length) ?? undefined;
    if (intent) return { label, inScope, score: 0, intent, expectSource, sources: [] };
    const { scored, score } = lexicalTurn(chunks, question, conversation, k);
    return { label, inScope, score, expectSource, sources: scored.map((s) => s.chunk.source) };
  });
}

/**
 * A lexical threshold that refuses every off-topic question reaching retrieval
 * and lets the most in-scope ones through: midway between the highest off-topic
 * score and the lowest in-scope score above it, so both sides keep a margin.
 */
export function pickLexicalThreshold(rows: LexicalRow[]): number {
  const out = Math.max(0, ...rows.filter((r) => !r.inScope && !r.intent).map((r) => r.score));
  const above = rows.filter((r) => r.inScope && r.score > out).map((r) => r.score);
  return (out + (above.length ? Math.min(...above) : out + 0.1)) / 2;
}
