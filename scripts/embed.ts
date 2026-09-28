/**
 * Build step: read content/*.md → structure-aware chunks → Gemini embeddings →
 * lib/kb.json. Run with `npm run embed` (loads .env.local for the API key).
 *
 * kb.json is committed, so deploys don't need to re-embed. Re-run this whenever
 * the content/ knowledge base changes. A chunk whose source, section and text
 * are unchanged keeps its committed embedding, so an edit costs one call per
 * changed chunk of the daily quota, not ~150. After changing the embed input's
 * format (the chunker's breadcrumb), run `npm run embed -- --full`.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chunkDocument } from "../lib/rag/chunker";
import { embedText, EMBED } from "../lib/rag/embed";
import type { KBChunk, KnowledgeBase } from "../lib/rag/types";
import { collectDocs } from "./collect-docs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "kb.json");

const keyOf = (c: { source: string; section: string; text: string }) =>
  `${c.source}\n${c.section}\n${c.text}`;

/** The committed embeddings by chunk content, if they came from the current model. */
async function committed(): Promise<Map<string, number[]>> {
  try {
    const kb = JSON.parse(await readFile(OUT, "utf8")) as KnowledgeBase;
    const same = kb.model === EMBED.model && kb.dim === EMBED.dim && kb.version === EMBED.version;
    return new Map(same ? kb.chunks.map((c) => [keyOf(c), c.embedding]) : []);
  } catch {
    return new Map();
  }
}

async function main() {
  const docs = await collectDocs();
  const parsed = docs.flatMap(chunkDocument);
  console.log(`Parsed ${parsed.length} chunks from ${docs.length} documents.`);
  const reuse = process.argv.includes("--full") ? new Map<string, number[]>() : await committed();

  const chunks: KBChunk[] = [];
  let calls = 0;
  for (let i = 0; i < parsed.length; i++) {
    const c = parsed[i];
    let embedding = reuse.get(keyOf(c));
    if (!embedding) {
      embedding = await embedText(c.embedInput, "RETRIEVAL_DOCUMENT");
      calls++;
    }
    chunks.push({ id: c.id, source: c.source, section: c.section, text: c.text, embedding });
    process.stdout.write(`\rChunk ${i + 1}/${parsed.length} · ${calls} embedded`);
  }
  process.stdout.write(`\n${parsed.length - calls} unchanged chunks kept their embedding.\n`);

  const kb: KnowledgeBase = {
    model: EMBED.model,
    dim: EMBED.dim,
    version: EMBED.version,
    count: chunks.length,
    chunks,
  };

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(kb));
  console.log(`Wrote ${OUT}\n  ${chunks.length} chunks · ${EMBED.dim}d · model ${EMBED.model}`);
}

main().catch((err) => {
  console.error("\nEmbed failed:", err);
  process.exit(1);
});
