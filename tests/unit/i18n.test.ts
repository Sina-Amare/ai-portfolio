import { describe, it, expect } from "vitest";
import { detectDir, isRTL, ui } from "@/lib/i18n";

describe("i18n", () => {
  it("detects RTL for Persian text", () => {
    expect(detectDir("سلام دنیا")).toBe("rtl");
  });

  it("detects LTR for English text", () => {
    expect(detectDir("hello world")).toBe("ltr");
  });

  it("treats mixed text containing Persian as RTL", () => {
    expect(detectDir("hello سلام")).toBe("rtl");
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
});
