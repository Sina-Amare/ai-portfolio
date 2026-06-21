import { describe, it, expect } from "vitest";
import { dot, l2normalize, cosineNormalized } from "@/lib/rag/cosine";

describe("cosine", () => {
  it("dot computes the dot product", () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  it("l2normalize returns a unit vector", () => {
    const n = l2normalize([3, 4]);
    expect(Math.hypot(n[0], n[1])).toBeCloseTo(1);
    expect(n[0]).toBeCloseTo(0.6);
  });

  it("cosineNormalized of identical unit vectors is ~1", () => {
    const a = l2normalize([1, 2, 3]);
    expect(cosineNormalized(a, a)).toBeCloseTo(1);
  });

  it("orthogonal vectors score 0", () => {
    expect(cosineNormalized([1, 0], [0, 1])).toBe(0);
  });

  it("handles the zero vector without NaN", () => {
    expect(l2normalize([0, 0])).toEqual([0, 0]);
  });
});
