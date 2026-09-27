/**
 * Deterministic RAG retrieval gate (no LLM judge needed):
 * - in-scope questions must NOT be refused (gate score >= threshold)
 * - items with expectSource must surface that source in the top-k
 * - items with `history` are later turns, ranked exactly as the route ranks them
 *   (the question alone plus the conversation-aware query, `rankTurn`)
 * - out-of-scope questions MUST be refused (gate score < threshold), after a
 *   project chat too (an entry with `history`)
 * - a chip and its entity-swapped twin must stay below the semantic-cache threshold
 *
 * Run with `npm run eval` (loads .env.local for the embedding key); pass a path
 * to run another golden file. Ends with the lowest in-scope and highest
 * out-of-scope top scores: the gap the relevance threshold has to sit in.
 * This is the highest-value anti-hallucination check: a wrong refusal decision
 * or missing retrieval is exactly what produces fabricated or unhelpful answers.
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { UIMessage } from "ai";
import { SEMANTIC_CACHE_THRESHOLD } from "../lib/rag/cache";
import { cosineNormalized } from "../lib/rag/cosine";
import { embedText } from "../lib/rag/embed";
import { sanitizeInput } from "../lib/rag/prompt";
import { rankTurn, retrievalQuery } from "../lib/rag/retrieve";
import { RELEVANCE_THRESHOLD } from "../lib/rag/threshold";
import type { KBChunk, KnowledgeBase } from "../lib/rag/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

type Turn = { role: "user" | "assistant"; text: string };
type Golden = {
  inScope: { q: string; expectSource?: string; history?: Turn[] }[];
  outOfScope: (string | { q: string; history: Turn[] })[];
};

/** [suggestion chip, the same question about a different project]. */
const NEAR_MISS_PAIRS: [string, string][] = [
  ["What is ScrapeGPT?", "What is Aigram?"],
  ["What is ScrapeGPT?", "What is RubricEval?"],
  ["What can Aigram do?", "What can PromptAmp do?"],
  ["ScrapeGPT چیه؟", "Aigram چیه؟"],
  ["ScrapeGPT چیه؟", "RubricEval چیه؟"],
  ["Aigram چه کارهایی می‌کنه؟", "PromptAmp چه کارهایی می‌کنه؟"],
];

/** The top 5 and gate score the chat route gets for this question after these turns. */
async function rank(chunks: KBChunk[], q: string, history: Turn[] = []) {
  const messages: UIMessage[] = [...history, { role: "user" as const, text: q }].map((t, i) => ({
    id: String(i),
    role: t.role,
    parts: [{ type: "text", text: t.role === "user" ? sanitizeInput(t.text) : t.text.trim() }],
  }));
  const question = sanitizeInput(q);
  const conversation = sanitizeInput(retrievalQuery(messages)) || question;
  const [alone, chat] = await Promise.all([
    embedText(question, "RETRIEVAL_QUERY"),
    conversation === question ? null : embedText(conversation, "RETRIEVAL_QUERY"),
  ]);
  return rankTurn(chunks, question, alone, chat, 5);
}

async function main() {
  const kb = JSON.parse(await readFile(join(ROOT, "lib", "kb.json"), "utf8")) as KnowledgeBase;
  const goldenPath = process.argv[2] ?? join(ROOT, "eval", "golden.json");
  const golden = JSON.parse(await readFile(goldenPath, "utf8")) as Golden;

  let pass = 0;
  const failures: string[] = [];
  let minIn = { score: Infinity, q: "" };
  let maxOut = { score: -Infinity, q: "" };
  console.log(`RAG eval · threshold=${RELEVANCE_THRESHOLD} · ${kb.count} chunks\n`);

  for (const item of golden.inScope) {
    const label = item.history ? `${item.q}  ⟵ ${item.history.length} earlier turns` : item.q;
    const { scored, score } = await rank(kb.chunks, item.q, item.history);
    const sources = scored.map((t) => t.chunk.source);
    const inScope = score >= RELEVANCE_THRESHOLD;
    const ok = inScope && (!item.expectSource || sources.includes(item.expectSource));
    if (score < minIn.score) minIn = { score, q: label };
    if (ok) pass++;
    else
      failures.push(
        `IN  ✗ [${score.toFixed(3)}] "${label}"` +
          (item.expectSource && inScope
            ? ` — want ${item.expectSource}, got [${sources.join(", ")}]`
            : " — wrongly refused"),
      );
    console.log(`${ok ? "✓" : "✗"} IN  ${score.toFixed(3)}  ${label}`);
  }

  for (const item of golden.outOfScope) {
    const { q, history } = typeof item === "string" ? { q: item, history: undefined } : item;
    const label = history ? `${q}  ⟵ ${history.length} earlier turns` : q;
    const { score } = await rank(kb.chunks, q, history);
    const refused = score < RELEVANCE_THRESHOLD;
    if (score > maxOut.score) maxOut = { score, q: label };
    if (refused) pass++;
    else failures.push(`OUT ✗ [${score.toFixed(3)}] "${label}" — should refuse`);
    console.log(`${refused ? "✓" : "✗"} OUT ${score.toFixed(3)}  ${label}`);
  }

  // A chip's cached answer is served to any first-turn question this close to
  // it, so a chip and the same question about another project must stay apart.
  for (const [chip, swapped] of NEAR_MISS_PAIRS) {
    const [a, b] = await Promise.all([
      embedText(chip, "RETRIEVAL_QUERY"),
      embedText(swapped, "RETRIEVAL_QUERY"),
    ]);
    const sim = cosineNormalized(a, b);
    const ok = sim < SEMANTIC_CACHE_THRESHOLD;
    if (ok) pass++;
    else
      failures.push(`CACHE ✗ [${sim.toFixed(3)}] "${chip}" ≈ "${swapped}" — would share an answer`);
    console.log(`${ok ? "✓" : "✗"} CACHE ${sim.toFixed(3)}  ${chip}  vs  ${swapped}`);
  }

  const total = golden.inScope.length + golden.outOfScope.length + NEAR_MISS_PAIRS.length;
  console.log(`\n${pass}/${total} passed`);
  console.log(`lowest in-scope   ${minIn.score.toFixed(3)}  ${minIn.q}`);
  console.log(`highest off-topic ${maxOut.score.toFixed(3)}  ${maxOut.q}`);
  console.log(`gap ${(minIn.score - maxOut.score).toFixed(3)} · threshold ${RELEVANCE_THRESHOLD}`);
  if (failures.length) {
    console.log("\nFailures:\n" + failures.join("\n"));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
