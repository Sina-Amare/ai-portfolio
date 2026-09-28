/**
 * Build step: read content/*.md → structure-aware chunks → Gemini embeddings →
 * lib/kb.json. Run with `npm run embed` (loads .env.local for the API key).
 *
 * kb.json is committed, so deploys don't need to re-embed. Re-run this whenever
 * the content/ knowledge base changes. A chunk whose source, section and text
 * are unchanged keeps its committed embedding, so an edit costs one call per
 * changed chunk of the daily quota, not ~150. A new model, version or embed
 * template (the chunker's breadcrumb) re-embeds everything; `-- --full` forces it.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chunkDocument, EMBED_TEMPLATE } from "../lib/rag/chunker";
import { embedText, EMBED } from "../lib/rag/embed";
import type { KBChunk, KnowledgeBase } from "../lib/rag/types";
import { collectDocs, reusableEmbeddings, reuseKey } from "./collect-docs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "lib", "kb.json");

async function committed(): Promise<Map<string, number[]>> {
  try {
    return reusableEmbeddings(JSON.parse(await readFile(OUT, "utf8")) as KnowledgeBase);
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
    let embedding = reuse.get(reuseKey(c));
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
    template: EMBED_TEMPLATE,
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
