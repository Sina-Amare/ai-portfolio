/**
 * Deterministic RAG retrieval gate (no LLM judge needed):
 * - in-scope questions must NOT be refused (top score >= threshold)
 * - items with expectSource must surface that source in the top-k
 * - out-of-scope questions MUST be refused (top score < threshold)
 *
 * Run with `npm run eval` (loads .env.local for the embedding key).
 * This is the highest-value anti-hallucination check: a wrong refusal decision
 * or missing retrieval is exactly what produces fabricated or unhelpful answers.
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { embedText } from "../lib/rag/embed";
import { retrieve } from "../lib/rag/retrieve";
import { RELEVANCE_THRESHOLD, isInScope } from "../lib/rag/threshold";
import type { KnowledgeBase } from "../lib/rag/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

type Golden = {
  inScope: { q: string; expectSource?: string }[];
  outOfScope: string[];
};

async function main() {
  const kb = JSON.parse(
    await readFile(join(ROOT, "lib", "kb.json"), "utf8"),
  ) as KnowledgeBase;
  const golden = JSON.parse(
    await readFile(join(ROOT, "eval", "golden.json"), "utf8"),
  ) as Golden;

  let pass = 0;
  const failures: string[] = [];
  console.log(
    `RAG eval · threshold=${RELEVANCE_THRESHOLD} · ${kb.count} chunks\n`,
  );

  for (const item of golden.inScope) {
    const top = retrieve(kb.chunks, await embedText(item.q, "RETRIEVAL_QUERY"), 5);
    const sources = top.map((t) => t.chunk.source);
    const ok =
      isInScope(top) && (!item.expectSource || sources.includes(item.expectSource));
    if (ok) pass++;
    else
      failures.push(
        `IN  ✗ [${top[0].score.toFixed(2)}] "${item.q}"` +
          (item.expectSource
            ? ` — want ${item.expectSource}, got [${sources.join(", ")}]`
            : " — wrongly refused"),
      );
    console.log(`${ok ? "✓" : "✗"} IN  ${top[0].score.toFixed(2)}  ${item.q}`);
  }

  for (const q of golden.outOfScope) {
    const top = retrieve(kb.chunks, await embedText(q, "RETRIEVAL_QUERY"), 5);
    const refused = !isInScope(top);
    if (refused) pass++;
    else failures.push(`OUT ✗ [${top[0].score.toFixed(2)}] "${q}" — should refuse`);
    console.log(`${refused ? "✓" : "✗"} OUT ${top[0].score.toFixed(2)}  ${q}`);
  }

  const total = golden.inScope.length + golden.outOfScope.length;
  console.log(`\n${pass}/${total} passed`);
  if (failures.length) {
    console.log("\nFailures:\n" + failures.join("\n"));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
