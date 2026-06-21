/**
 * Build step: read content/*.md → structure-aware chunks → Gemini embeddings →
 * lib/kb.json. Run with `npm run embed` (loads .env.local for the API key).
 *
 * kb.json is committed, so deploys don't need to re-embed. Re-run this whenever
 * the content/ knowledge base changes.
 */
import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chunkDocument, type SourceDoc } from "../lib/rag/chunker";
import { embedText, EMBED } from "../lib/rag/embed";
import type { KBChunk, KnowledgeBase } from "../lib/rag/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "content");
const OUT = join(ROOT, "lib", "kb.json");

const SOURCE_LABELS: Record<string, string> = {
  "cv.md": "CV",
  "faq.md": "FAQ",
};

function titleFrom(text: string, fallback: string): string {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback.replace(/\.md$/, "");
}

async function readMarkdownDir(
  dir: string,
  label: (name: string, text: string) => { id: string; source: string },
): Promise<SourceDoc[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const docs: SourceDoc[] = [];
  for (const e of entries) {
    if (e.isFile() && e.name.endsWith(".md")) {
      const text = await readFile(join(dir, e.name), "utf8");
      const { id, source } = label(e.name, text);
      docs.push({ id, source, text });
    }
  }
  return docs;
}

async function collectDocs(): Promise<SourceDoc[]> {
  const top = await readMarkdownDir(CONTENT, (name, text) => ({
    id: name.replace(/\.md$/, ""),
    source: SOURCE_LABELS[name] ?? titleFrom(text, name),
  }));
  const projects = await readMarkdownDir(join(CONTENT, "projects"), (name, text) => ({
    id: `projects/${name.replace(/\.md$/, "")}`,
    source: `Project: ${titleFrom(text, name)}`,
  }));
  return [...top, ...projects];
}

async function main() {
  const docs = await collectDocs();
  const parsed = docs.flatMap(chunkDocument);
  console.log(`Parsed ${parsed.length} chunks from ${docs.length} documents.`);

  const chunks: KBChunk[] = [];
  for (let i = 0; i < parsed.length; i++) {
    const c = parsed[i];
    const embedding = await embedText(c.embedInput, "RETRIEVAL_DOCUMENT");
    chunks.push({ id: c.id, source: c.source, section: c.section, text: c.text, embedding });
    process.stdout.write(`\rEmbedded ${i + 1}/${parsed.length}`);
  }
  process.stdout.write("\n");

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
