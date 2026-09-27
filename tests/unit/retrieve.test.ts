import { describe, it, expect } from "vitest";
import type { UIMessage } from "ai";
import { isFollowUp, rankTurn, retrievalQuery, retrieve } from "@/lib/rag/retrieve";
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
    for (const name of ["ای‌گرام", "آیگرام", "آی‌گرام"]) {
      const fa = chat(["user", `${name} چیه؟`], ["assistant", "…"], ["user", "a"], ["user", "b"]);
      expect(retrievalQuery(fa), name).toBe("Aigram a b");
    }
    const reply = chat(
      ["user", "Your code review bot?"],
      ["assistant", "That's github-code-review."],
    );
    expect(retrievalQuery([...reply, ...chat(["user", "Is it tested?"])])).toBe(
      "RubricEval Your code review bot? Is it tested?",
    );
  });

  it("carries nothing when the turns already name one, or every mention is ambiguous", () => {
    const named = chat(["user", "What is Aigram?"], ["user", "And ScrapeGPT's tests?"]);
    expect(retrievalQuery(named)).toBe("What is Aigram? And ScrapeGPT's tests?");
    const both = chat(
      ["user", "ScrapeGPT or Aigram?"],
      ["assistant", "ScrapeGPT rotates keys, like Aigram."],
      ["user", "Nice."],
      ["user", "Tests?"],
    );
    expect(retrievalQuery(both)).toBe("Nice. Tests?");
  });

  it("skips a reply that cross-references, and keeps the project the visitor named", () => {
    const q = retrievalQuery(
      chat(
        ["user", "What is Aigram?"],
        ["assistant", "Aigram rotates keys the way I did at Dekamond."],
        ["user", "What stack?"],
        ["assistant", "Python and FastAPI."],
        ["user", "Tests?"],
      ),
    );
    expect(q).toBe("Aigram What stack? Tests?");
  });

  it("carries nothing older than the last two exchanges", () => {
    const q = retrievalQuery(
      chat(
        ["user", "What is Aigram?"],
        ["assistant", "Aigram is my Telegram client."],
        ["user", "Where did you study?"],
        ["assistant", "At the University of Guilan."],
        ["user", "Any awards?"],
        ["assistant", "Yes, a few."],
        ["user", "What's your notice period?"],
      ),
    );
    expect(q).toBe("Any awards? What's your notice period?");
  });

  it("keeps the question being asked whole after a long pasted turn", () => {
    const pasted = "We need a backend engineer. ".repeat(21).trim(); // 587 chars
    const q = retrievalQuery(chat(["user", pasted], ["user", "What about PromptAmp?"]));
    expect(q.endsWith(" What about PromptAmp?")).toBe(true);
    expect(q.length).toBeLessThanOrEqual(200 + 1 + "What about PromptAmp?".length);
    const long = "x".repeat(590);
    expect(retrievalQuery(chat(["user", "What is Aigram?"], ["user", long]))).toBe(
      `What is A ${long}`,
    );
  });
});

describe("isFollowUp", () => {
  it("spots a question that leans on the last turn", () => {
    for (const q of [
      "Does it have tests?",
      "What would you do differently?",
      "and the challenges?",
      "What about the frontend?",
      "Why?",
      "Tell me more",
      "محدودیت‌هاش چیه؟",
      "چطوری تستش کردی؟",
      "اینو بیشتر توضیح بده لطفا",
    ]) {
      expect(isFollowUp(q), q).toBe(true);
    }
  });

  it("lets a new topic stand on its own", () => {
    for (const q of [
      "What are your salary expectations?",
      "What's your biggest weakness?",
      "Where did you study?",
      "Why did you leave Dekamond?",
      "What is the capital of France?",
      "دستور پخت قورمه‌سبزی رو بهم بگو",
    ]) {
      expect(isFollowUp(q), q).toBe(false);
    }
  });
});

describe("rankTurn", () => {
  const kb: KBChunk[] = ["a", "b", "c", "d"].map((id, i) => ({
    id,
    source: "CV",
    section: id,
    text: id,
    embedding: [0, 0, 0, 0].map((_, j) => (i === j ? 1 : 0)),
  }));
  const ids = (r: { scored: { chunk: KBChunk }[] }) => r.scored.map((s) => s.chunk.id);
  const alone = [0.8, 0.6, 0, 0]; // the question alone: a, then b
  const chat = [0, 0.1, 0.9, 0.7]; // the conversation: c, then d

  it("is the question's own top-k on the first turn", () => {
    expect(rankTurn(kb, "Where did you study?", alone, null, 2)).toEqual({
      scored: retrieve(kb, alone, 2),
      score: 0.8,
    });
  });

  it("alternates both readings, the question's first for a new topic, and gates on it", () => {
    const r = rankTurn(kb, "What are your salary expectations?", alone, chat, 3);
    expect(ids(r)).toEqual(["a", "c", "b"]);
    expect(r.score).toBe(0.8);
    // Off-topic alone and on-topic only through the chat: the gate refuses it.
    expect(rankTurn(kb, "What is the capital of France?", [0, 0.1, 0, 0], chat, 3).score).toBe(0.1);
  });

  it("puts the chat's reading first for a follow-up, and lets it pass the gate", () => {
    const r = rankTurn(kb, "Does it have tests?", [0, 0.1, 0, 0], chat, 3);
    expect(ids(r)).toEqual(["c", "b", "d"]);
    expect(r.score).toBe(0.9);
  });
});
