import { describe, it, expect } from "vitest";
import { chunkDocument } from "@/lib/rag/chunker";

describe("chunkDocument", () => {
  it("splits on H2 headings, keeping heading + body together", () => {
    const chunks = chunkDocument({
      id: "t",
      source: "CV",
      text: "# Title\n## Section A\nBody A line.\n## Section B\nBody B line.",
    });
    expect(chunks).toHaveLength(2);
    expect(chunks[0].section).toBe("Section A");
    expect(chunks[0].text).toContain("Section A");
    expect(chunks[0].text).toContain("Body A");
    expect(chunks[0].id).toBe("t#0");
  });

  it("adds a context breadcrumb to the embedding input", () => {
    const [chunk] = chunkDocument({
      id: "t",
      source: "CV",
      text: "## Skills\nPython and FastAPI.",
    });
    expect(chunk.embedInput).toContain("Owner: Sina Amareh");
    expect(chunk.embedInput).toContain("CV › Skills");
    expect(chunk.embedInput).toContain("Python and FastAPI");
  });

  it("creates an Overview chunk for content before the first heading", () => {
    const [chunk] = chunkDocument({
      id: "t",
      source: "CV",
      text: "# Title\nThis intro paragraph has enough content to keep.",
    });
    expect(chunk.section).toBe("Overview");
  });

  it("skips trivial / empty sections", () => {
    const chunks = chunkDocument({
      id: "t",
      source: "CV",
      text: "## Empty\n   \n## Real\nThis section has enough real content to keep.",
    });
    expect(chunks.map((c) => c.section)).toEqual(["Real"]);
  });

  it("splits very long sections into multiple chunks of the same section", () => {
    const long = Array.from(
      { length: 30 },
      (_, i) => `Paragraph ${i} ` + "x".repeat(60),
    ).join("\n\n");
    const chunks = chunkDocument({ id: "t", source: "CV", text: `## Big\n${long}` });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((c) => c.section === "Big")).toBe(true);
  });
});
