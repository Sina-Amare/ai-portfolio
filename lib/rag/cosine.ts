/** Dot product of two equal-length vectors. */
export function dot(a: number[], b: number[]): number {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/** L2-normalize a vector so that downstream cosine == dot product. */
export function l2normalize(v: number[]): number[] {
  let s = 0;
  for (const x of v) s += x * x;
  const norm = Math.sqrt(s) || 1;
  return v.map((x) => x / norm);
}

/** Cosine similarity assuming both inputs are already L2-normalized. */
export function cosineNormalized(a: number[], b: number[]): number {
  return dot(a, b);
}
