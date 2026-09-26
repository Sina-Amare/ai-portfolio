import { describe, it, expect } from "vitest";
import { detectDir, isRTL, ui } from "@/lib/i18n";
import golden from "@/eval/golden.json";

describe("i18n", () => {
  it("detects RTL for Persian text", () => {
    expect(detectDir("سلام دنیا")).toBe("rtl");
  });

  it("detects LTR for English text", () => {
    expect(detectDir("hello world")).toBe("ltr");
  });

  it("decides mixed text by word count, Persian words counting double", () => {
    // Persian with Latin tech terms — including a chip where the Latin word is longer.
    expect(detectDir("ScrapeGPT چیه؟")).toBe("rtl");
    expect(detectDir("چطوری RAG رو با FastAPI و Redis ساختی؟")).toBe("rtl");
    expect(detectDir("LLM API RAG MCP رو توضیح بده")).toBe("rtl");
    // English quoting one Persian word stays LTR.
    expect(detectDir("I grew up speaking Persian (فارسی) and English.")).toBe("ltr");
  });

  it("ignores a stray BOM", () => {
    expect(detectDir("\uFEFFhello world")).toBe("ltr");
    expect(detectDir("\uFEFF")).toBe("ltr");
  });

  it("isRTL is true only for Persian", () => {
    expect(isRTL("fa")).toBe(true);
    expect(isRTL("en")).toBe(false);
  });

  it("provides strings and suggestions for both languages", () => {
    expect(ui.en.suggestions.length).toBeGreaterThan(0);
    expect(ui.fa.suggestions.length).toBeGreaterThan(0);
    expect(ui.fa.dir).toBe("rtl");
  });

  // A chip the retrieval gate refuses would be the bot declining its own
  // suggestion; `npm run eval` only catches that if the chip is in the set.
  it("puts every suggestion chip in the RAG golden set", () => {
    const goldenQs = golden.inScope.map((item) => item.q);
    for (const chip of [...ui.en.suggestions, ...ui.fa.suggestions]) {
      expect(goldenQs).toContain(chip);
    }
  });
});
