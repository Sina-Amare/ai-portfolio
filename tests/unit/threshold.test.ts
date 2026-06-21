import { describe, it, expect } from "vitest";
import { isInScope, topScore } from "@/lib/rag/threshold";
import type { ScoredChunk } from "@/lib/rag/types";

const at = (score: number): ScoredChunk[] => [
  { chunk: { id: "x", source: "s", section: "a", text: "t", embedding: [] }, score },
];

describe("threshold", () => {
  it("topScore returns the best score, or 0 when empty", () => {
    expect(topScore([])).toBe(0);
    expect(topScore(at(0.7))).toBe(0.7);
  });

  it("is in scope when the top score meets the threshold", () => {
    expect(isInScope(at(0.7), 0.62)).toBe(true);
    expect(isInScope(at(0.62), 0.62)).toBe(true);
  });

  it("is out of scope when below the threshold", () => {
    expect(isInScope(at(0.5), 0.62)).toBe(false);
  });

  it("treats empty retrieval as out of scope", () => {
    expect(isInScope([], 0.62)).toBe(false);
  });
});
