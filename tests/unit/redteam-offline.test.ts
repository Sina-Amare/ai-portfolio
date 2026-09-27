import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { classifyIntent, isAttack, scrubHistory, type Intent } from "@/lib/rag/intent";

type Case = {
  id: string;
  class: string;
  lang: "en" | "fa" | "finglish";
  q: string;
  expect: "clapback" | "smalltalk" | "answer" | "correct-premise" | "no-leak" | "refuse";
  intent?: Intent;
  history?: { role: "user" | "assistant"; text: string }[];
  dropped?: number[];
  mustNot?: string[];
};

const { cases } = JSON.parse(
  readFileSync(resolve(__dirname, "../../eval/redteam.json"), "utf8"),
) as { cases: Case[] };

const turn = (role: string, text: string) => ({ role, parts: [{ type: "text", text }] });

// The offline half of the red-team set: what the classifier and the history
// scrub must decide, with no network. The live half (answers, premises, leaks)
// needs a model and runs outside CI.
describe("red team, offline", () => {
  it("covers every class in English, Persian and Finglish", () => {
    expect(cases.length).toBeGreaterThanOrEqual(64);
    expect(new Set(cases.map((c) => c.id)).size).toBe(cases.length);
    const count = (f: (c: Case) => boolean) => cases.filter(f).length;
    expect(count((c) => c.lang === "fa")).toBeGreaterThanOrEqual(15);
    expect(count((c) => c.lang === "finglish")).toBeGreaterThanOrEqual(5);
    expect(count((c) => c.class === "legit")).toBeGreaterThanOrEqual(15);
    expect(count((c) => !!c.history)).toBeGreaterThanOrEqual(5);
    for (const cls of ["injection", "extraction", "encoded", "task", "identity", "insult"]) {
      expect(
        count((c) => c.class === cls),
        cls,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  for (const c of cases) {
    it(`${c.id}: ${c.expect}${c.intent ? ` (${c.intent})` : ""}`, () => {
      // A case with history is a follow-up, as in the route.
      const intent = classifyIntent(c.q, !!c.history);
      if (c.expect === "clapback" || c.expect === "smalltalk") {
        expect(intent, c.q).toBe(c.intent);
        // Clapbacks answer misuse or insults; small talk is conversation.
        expect(isAttack(intent) || intent === "insult", c.q).toBe(c.expect === "clapback");
      } else {
        expect(intent, c.q).toBeNull();
      }

      if (c.history) {
        const history = c.history.map((h) => turn(h.role, h.text));
        const question = turn("user", c.q);
        const kept = scrubHistory([...history, question]);
        const dropped = new Set(c.dropped ?? []);
        const want = history.filter((_, i) => !dropped.has(i));
        if (!isAttack(intent)) want.push(question);
        expect(kept).toEqual(want);
      }
    });
  }
});
