// @vitest-environment node
import { afterEach, describe, it, expect, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("chatLadder", () => {
  it("rotates which key leads, but a rung id always names the same key", async () => {
    vi.stubEnv("GROQ_API_KEY", "key-a,key-b");
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.resetModules();
    const { chatLadder } = await import("@/lib/rag/providers");

    const first = chatLadder("en").map((p) => p.id);
    const second = chatLadder("en").map((p) => p.id);
    // The route cools a rung down by id after a 429, so "#1" must mean key-b on
    // every request, not "whichever key is second after this request's rotation".
    expect(first[0]).toBe("groq:llama-3.3-70b-versatile#0");
    expect(second[0]).toBe("groq:llama-3.3-70b-versatile#1");
    expect(new Set(second)).toEqual(new Set(first));
  });
});
