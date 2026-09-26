// @vitest-environment node
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("embedText", () => {
  it("gives up on a hung key after 8s and answers from the next key", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "key-a,key-b");
    vi.resetModules();
    const { embedText } = await import("@/lib/rag/embed");

    // Shrink the 8s per-key timeout so the test runs in milliseconds, but pin
    // that 8s is what the code asks for.
    const realTimeout = AbortSignal.timeout.bind(AbortSignal);
    const timeout = vi.spyOn(AbortSignal, "timeout").mockImplementation(() => realTimeout(20));

    vi.stubGlobal(
      "fetch",
      vi.fn((url: string, init: RequestInit) => {
        if (url.includes("key=key-b")) {
          return Promise.resolve(Response.json({ embedding: { values: [3, 4] } }));
        }
        // key-a hangs until its signal aborts.
        return new Promise((_, reject) => {
          init.signal!.addEventListener("abort", () => reject(init.signal!.reason));
        });
      }),
    );

    // A live caller signal: its presence alone must not stop the key loop.
    const values = await embedText("hi", "RETRIEVAL_QUERY", new AbortController().signal);

    expect(timeout).toHaveBeenCalledWith(8_000);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(values).toEqual([0.6, 0.8]);
  });
});
