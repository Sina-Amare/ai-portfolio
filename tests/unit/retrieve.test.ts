import { describe, it, expect } from "vitest";
import type { UIMessage } from "ai";
import { retrievalQuery, retrieve } from "@/lib/rag/retrieve";
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

const chat = (...turns: [UIMessage["role"], string][]): UIMessage[] =>
  turns.map(([role, text], i) => ({ id: String(i), role, parts: [{ type: "text", text }] }));

describe("retrievalQuery", () => {
  it("joins the last two user turns, oldest first, and skips the replies", () => {
    const q = retrievalQuery(
      chat(
        ["user", "Where did you study?"],
        ["assistant", "At the University of Guilan."],
        ["user", "What did you build at Dekamond?"],
        ["assistant", "Multi-provider LLM workflows."],
        ["user", "and the challenges?"],
      ),
    );
    expect(q).toBe("What did you build at Dekamond? and the challenges?");
  });

  it("is just the question on the first turn", () => {
    expect(retrievalQuery(chat(["user", "What is RubricEval?"]))).toBe("What is RubricEval?");
  });

  it("carries the project a follow-up points back to, ahead of the turns", () => {
    const q = retrievalQuery(
      chat(
        ["user", "What is Aigram?"],
        ["assistant", "Aigram is my self-hosted Telegram client with AI built in."],
        ["user", "What stack did you use?"],
        ["assistant", "Python on Telethon and FastAPI."],
        ["user", "Does it have tests?"],
      ),
    );
    expect(q).toBe("Aigram What stack did you use? Does it have tests?");
  });

  it("recognises Persian and old spellings, and names from the reply", () => {
    const fa = chat(["user", "ای‌گرام چیه؟"], ["assistant", "…"], ["user", "a"], ["user", "b"]);
    expect(retrievalQuery(fa)).toBe("Aigram a b");
    const reply = chat(
      ["user", "Your code review bot?"],
      ["assistant", "That's github-code-review."],
    );
    expect(retrievalQuery([...reply, ...chat(["user", "Is it tested?"])])).toBe(
      "RubricEval Your code review bot? Is it tested?",
    );
  });

  it("carries nothing when the turns already name one, or the last mention is ambiguous", () => {
    const named = chat(["user", "What is Aigram?"], ["user", "And ScrapeGPT's tests?"]);
    expect(retrievalQuery(named)).toBe("What is Aigram? And ScrapeGPT's tests?");
    const both = chat(
      ["user", "What is ScrapeGPT?"],
      ["assistant", "ScrapeGPT rotates keys, like Aigram."],
      ["user", "Nice."],
      ["user", "Tests?"],
    );
    expect(retrievalQuery(both)).toBe("Nice. Tests?");
  });
});
