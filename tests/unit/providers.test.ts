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

  it("leads English with Groq and Persian with Gemini 3.1, each model across every key", async () => {
    vi.stubEnv("GROQ_API_KEY", "g1,g2");
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "k1, k2");
    vi.stubEnv("OPENROUTER_API_KEY", "o1 o2");
    vi.resetModules();
    const { chatLadder } = await import("@/lib/rag/providers");

    // Provider family of each rung, runs collapsed: "groq,gemini,or".
    const families = (lang: "en" | "fa") =>
      chatLadder(lang)
        .map((p) => p.id.split(/[:-]/)[0])
        .filter((f, i, all) => f !== all[i - 1])
        .join(",");
    expect(families("en")).toBe("groq,gemini,or");
    expect(families("fa")).toBe("gemini,or,groq");

    const fa = chatLadder("fa").map((p) => p.id);
    // Persian opens on Gemini 3.1 (the best Persian) across both keys; Llama is its last resort.
    expect(fa.slice(0, 2).every((id) => id.startsWith("gemini-3.1-flash-lite#"))).toBe(true);
    expect(fa).toHaveLength(2 * (2 + 3 + 2)); // 2 keys × 7 models
  });

  // The old `:free` slugs started answering 404 and the backstop died silently.
  // Persian gets Ultra first (the only colloquial Persian), English gets the faster Super.
  it("backs up with free Nemotron 3 models, Persian Ultra first, reasoning off", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    vi.stubEnv("OPENROUTER_API_KEY", "o1");
    vi.resetModules();
    const { chatLadder } = await import("@/lib/rag/providers");

    const ultra = "or:nvidia/nemotron-3-ultra-550b-a55b:free#0";
    const superId = "or:nvidia/nemotron-3-super-120b-a12b:free#0";
    expect(chatLadder("fa").map((p) => p.id)).toEqual([ultra, superId]);
    expect(chatLadder("en").map((p) => p.id)).toEqual([superId, ultra]);
    for (const lang of ["en", "fa"] as const) {
      // With reasoning on, Ultra's first Persian token took 18 s (measured 2026-09-27).
      for (const p of chatLadder(lang)) {
        expect((p.model as unknown as { settings: object }).settings).toMatchObject({
          reasoning: { effort: "none" },
        });
      }
    }
  });
});
