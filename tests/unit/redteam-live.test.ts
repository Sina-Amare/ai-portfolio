// @vitest-environment node
import { describe, it, expect } from "vitest";
import { contextOf, numbersIn, parseStream, systemPromptOf } from "../../scripts/redteam";

// The live red-team run's own checks: a parser that misses a number or reads the
// wrong notes would let an invented figure pass as grounded.
describe("red team, live checks", () => {
  it("reads numbers the way answers write them", () => {
    expect(numbersIn("I cut LLM costs by ~70% at Dekamond in 2025.")).toEqual(["70", "2025"]);
    expect(numbersIn("Llama 3.3 70B, 1,000 users, 10,000,000 rows")).toEqual([
      "3.3",
      "70",
      "1000",
      "10000000",
    ]);
    expect(numbersIn("ScrapeGPT ۷۷۰ تست داره، نسخهٔ ۰٫۴")).toEqual(["770", "0.4"]);
  });

  it("skips list markers and digits inside words and addresses", () => {
    expect(numbersIn("1. ScrapeGPT\n2) Aigram\n  3. PromptAmp")).toEqual([]);
    expect(numbersIn("email sinaamareh0263@gmail.com, OAuth2, v0.4.2")).toEqual([]);
  });

  it("finds the CONTEXT block in Gemini and OpenAI-style request bodies", () => {
    const prompt = "RULES: only 3 lines\n\nCONTEXT:\n[1] (CV › Summary)\nSina cut costs by 70%.";
    const want = "[1] (CV › Summary)\nSina cut costs by 70%.";
    const gemini = { systemInstruction: { parts: [{ text: prompt }] }, contents: [] };
    const openai = { model: "llama", messages: [{ role: "system", content: prompt }] };
    expect(systemPromptOf(JSON.stringify(gemini))).toBe(prompt);
    expect(systemPromptOf(JSON.stringify(openai))).toBe(prompt);
    expect(contextOf(systemPromptOf(JSON.stringify(gemini)))).toBe(want);
    const embedding = JSON.stringify({ content: { parts: [{ text: "embed me" }] } });
    expect(contextOf(systemPromptOf(embedding))).toBe("");
  });

  it("rebuilds text, sources and errors from the UI message stream", () => {
    const sse = [
      'data: {"type":"text-start","id":"0"}',
      'data: {"type":"text-delta","id":"0","delta":"Hi "}',
      'data: {"type":"text-delta","id":"0","delta":"there"}',
      'data: {"type":"data-sources","id":"sources","data":[{"source":"CV","section":"Summary"}]}',
      'data: {"type":"error","errorText":"boom"}',
      "data: [DONE]",
    ].join("\n\n");
    expect(parseStream(sse)).toEqual({
      text: "Hi there",
      sources: [{ source: "CV", section: "Summary" }],
      errors: ["boom"],
    });
  });
});
