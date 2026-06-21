import type { ParsedChunk } from "./types";

const OWNER = "Sina Amareh";
const MAX_CHARS = 1400;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;

export type SourceDoc = { id: string; source: string; text: string };

/** Rough token estimate (chars / 4) for sizing chunks. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Structure-aware chunker. Splits a markdown doc on headings:
 * - `#` (H1) is the document title (not a chunk).
 * - `##`–`######` each start a new chunk (heading + body kept together).
 * - Content before the first heading becomes an "Overview" chunk.
 * Oversized sections are split on blank lines.
 */
export function chunkDocument(doc: SourceDoc): ParsedChunk[] {
  const lines = doc.text.replace(/\r\n/g, "\n").split("\n");
  const chunks: ParsedChunk[] = [];
  let heading: string | null = null;
  let body: string[] = [];
  let index = 0;

  const makeChunk = (text: string, section: string): ParsedChunk => ({
    id: `${doc.id}#${index++}`,
    source: doc.source,
    section,
    text,
    embedInput: `Owner: ${OWNER} — portfolio assistant knowledge.\nSource: ${doc.source} › ${section}\n\n${text}`,
  });

  const push = (text: string, section: string) => {
    if (text.replace(/\s/g, "").length < 16) return; // skip trivial
    if (text.length <= MAX_CHARS) {
      chunks.push(makeChunk(text, section));
      return;
    }
    let buf = "";
    for (const para of text.split(/\n{2,}/)) {
      if (buf && (buf + "\n\n" + para).length > MAX_CHARS) {
        chunks.push(makeChunk(buf.trim(), section));
        buf = para;
      } else {
        buf = buf ? `${buf}\n\n${para}` : para;
      }
    }
    if (buf.trim()) chunks.push(makeChunk(buf.trim(), section));
  };

  const flush = () => {
    const bodyText = body.join("\n").trim();
    body = [];
    const section = heading ?? "Overview";
    const text = heading ? `${heading}\n${bodyText}`.trim() : bodyText;
    if (text) push(text, section);
  };

  for (const line of lines) {
    const m = line.match(HEADING_RE);
    if (m) {
      const level = m[1].length;
      flush();
      heading = level === 1 ? null : m[2].trim();
      continue;
    }
    body.push(line);
  }
  flush();

  return chunks;
}
