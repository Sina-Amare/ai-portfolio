// @vitest-environment node
import { describe, it, expect } from "vitest";
import { chunkDocument, EMBED_TEMPLATE } from "@/lib/rag/chunker";
import { getKnowledgeBase } from "@/lib/rag/kb";
import { collectDocs, reusableEmbeddings } from "@/scripts/collect-docs";

/**
 * The chatbot answers from the committed lib/kb.json, not from content/. Edit a
 * .md file and forget `npm run embed`, and the live bot keeps answering from the
 * old (possibly removed) wording. Re-chunking needs no network, so compare what
 * `npm run embed` would write, minus the embeddings.
 */
describe("lib/kb.json", () => {
  it("matches content/ chunk for chunk (run `npm run embed` if this fails)", async () => {
    const byId = (a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id);
    const expected = (await collectDocs())
      .flatMap(chunkDocument)
      .map(({ id, source, section, text }) => ({ id, source, section, text }))
      .sort(byId);
    const committed = getKnowledgeBase()
      .chunks.map(({ id, source, section, text }) => ({ id, source, section, text }))
      .sort(byId);
    expect(committed).toEqual(expected);
  });

  it("was embedded from today's embed input, and `npm run embed` reuses nothing once it changes", () => {
    const kb = getKnowledgeBase();
    expect(kb.template).toBe(EMBED_TEMPLATE); // run `npm run embed` if this fails
    expect(reusableEmbeddings(kb).size).toBe(kb.count);
    expect(reusableEmbeddings({ ...kb, template: "Source: {source}\n\n{text}" }).size).toBe(0);
  });
});
