import { describe, it, expect } from "vitest";
import { retrieve } from "@/lib/rag/retrieve";
import type { KBChunk } from "@/lib/rag/types";

const chunks: KBChunk[] = [
  { id: "a", source: "CV", section: "A", text: "a", embedding: [1, 0, 0] },
  { id: "b", source: "CV", section: "B", text: "b", embedding: [0, 1, 0] },
  { id: "c", source: "CV", section: "C", text: "c", embedding: [0, 0, 1] },
];

describe("retrieve", () => {
  it("ranks by similarity and returns top-k", () => {
    const r = retrieve(chunks, [0.9, 0.1, 0], 2);
    expect(r).toHaveLength(2);
    expect(r[0].chunk.id).toBe("a");
    expect(r[0].score).toBeGreaterThan(r[1].score);
  });

  it("never returns more than the number of chunks", () => {
    expect(retrieve(chunks, [1, 0, 0], 10)).toHaveLength(3);
  });

  it("always returns at least one result", () => {
    expect(retrieve(chunks, [0, 0, 1], 0)).toHaveLength(1);
  });
});
