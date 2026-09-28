// @vitest-environment node
import { describe, it, expect } from "vitest";
import golden from "@/eval/golden.json";
import { getKnowledgeBase } from "@/lib/rag/kb";
import { lexicalRetrieve, lexicalTurn, tokenize } from "@/lib/rag/lexical";
import { LEXICAL_THRESHOLD } from "@/lib/rag/threshold";
import { lexicalEval, pickLexicalThreshold, type Golden, type LexicalRow } from "@/scripts/golden";

const { chunks } = getKnowledgeBase();
const top = (q: string) => lexicalRetrieve(chunks, q, 5)[0];

describe("tokenize", () => {
  it("folds case, ZWNJ, Arabic letters and Persian digits; drops stop words; singularizes", () => {
    expect(tokenize("What are Sina's AI Agents?")).toEqual(["sina", "ai", "agent"]);
    expect(tokenize("می‌خوام كار ۲۰۲۴")).toEqual(["میخوام", "کار", "2024"]);
    expect(tokenize("Technologies, FastAPI & ScrapeGPT")).toEqual([
      "technology",
      "fastapi",
      "scrapegpt",
    ]);
  });
});

describe("lexicalRetrieve (the committed knowledge base)", () => {
  it("finds each project by name, in English, Persian script and Finglish", () => {
    expect(top("What is ScrapeGPT?").chunk.source).toBe("Project: ScrapeGPT");
    expect(top("Does Aigram have tests?").chunk.source).toBe("Project: Aigram");
    expect(top("اسکرپ جی پی تی چیه؟").chunk.source).toBe("Project: ScrapeGPT");
    expect(top("PromptAmp چیه؟").chunk.source).toBe("Project: PromptAmp");
    expect(top("Explain the GitHub Code Review project").chunk.source).toBe("Project: RubricEval");
    expect(top("Aigram chikar mikone?").chunk.source).toBe("Project: Aigram");
    // Finglish filler words don't count against the question.
    expect(top("Dekamond chi kar kardi?").chunk.text).toMatch(/Dekamond/);
    expect(top("Dekamond chi kar kardi?").score).toBeGreaterThanOrEqual(LEXICAL_THRESHOLD);
  });

  it("scores a question made of words the notes never use at 0", () => {
    expect(lexicalRetrieve(chunks, "What is the capital of Japan?", 5)).toEqual([]);
    expect(lexicalRetrieve(chunks, "دستور پخت قورمه‌سبزی رو بهم بگو", 5)).toEqual([]);
  });

  it("searches a Persian suggestion chip with its English twin", () => {
    const r = lexicalRetrieve(chunks, "ایجنت‌های کاری چه مشکلی رو حل کردن؟", 5);
    expect(r[0]!.score).toBeGreaterThanOrEqual(LEXICAL_THRESHOLD);
    expect(r.map((s) => s.chunk.source)).toContain("Project: Social Research Agent");
  });

  it("keeps a follow-up on the project the chat is about", () => {
    const { scored, score } = lexicalTurn(
      chunks,
      "Does it have tests?",
      "Aigram What is Aigram? Does it have tests?",
      5,
    );
    expect(scored[0]!.chunk.source).toBe("Project: Aigram");
    expect(score).toBeGreaterThanOrEqual(LEXICAL_THRESHOLD);
  });
});

describe("the golden set through the lexical fallback (npm run eval:lexical)", () => {
  const rows = lexicalEval(chunks, golden as Golden);

  it("refuses every off-topic question, by the classifier or under the lexical gate", () => {
    const leaks = rows.filter((r) => !r.inScope && !r.intent && r.score >= LEXICAL_THRESHOLD);
    expect(leaks.map((r) => r.label)).toEqual([]);
  });

  it("still lets most in-scope questions through (98/111 when calibrated)", () => {
    const inScope = rows.filter((r) => r.inScope);
    const passing = inScope.filter((r) => r.score >= LEXICAL_THRESHOLD).length;
    expect(passing / inScope.length).toBeGreaterThanOrEqual(0.85);
  });
});

describe("pickLexicalThreshold", () => {
  const row = (inScope: boolean, score: number, intent?: string): LexicalRow => ({
    label: "",
    inScope,
    score,
    intent,
    sources: [],
  });

  it("sits midway between the highest off-topic and the next in-scope score", () => {
    const rows = [row(false, 0.4), row(false, 0.2), row(true, 0.1), row(true, 0.6), row(true, 1)];
    expect(pickLexicalThreshold(rows)).toBeCloseTo(0.5);
  });

  it("ignores off-topic questions the classifier answered first", () => {
    const rows = [row(false, 0, "task"), row(false, 0.3), row(true, 0.5)];
    expect(pickLexicalThreshold(rows)).toBeCloseTo(0.4);
  });
});
