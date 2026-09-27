/**
 * content/*.md + content/projects/*.md → source documents for the chunker.
 * Shared by `npm run embed` and the test that keeps lib/kb.json in sync with
 * content/, so both walk the knowledge base the same way.
 */
import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { SourceDoc } from "../lib/rag/chunker";

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), "..", "content");

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

export async function collectDocs(): Promise<SourceDoc[]> {
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
