import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { UIMessage } from "ai";
import { Message } from "@/components/chat/message";

type Source = { source: string; section: string };

function mkMessage(role: "user" | "assistant", text: string, sources?: Source[]): UIMessage {
  return {
    id: "1",
    role,
    parts: [...(sources ? [{ type: "data-sources", data: sources }] : []), { type: "text", text }],
  } as unknown as UIMessage;
}

describe("Message", () => {
  it("renders a user message as plain text", () => {
    render(<Message message={mkMessage("user", "Hello there")} sourcesLabel="Sources" />);
    expect(screen.getByText("Hello there")).toBeInTheDocument();
  });

  it("loads the markdown parser lazily, showing the answer as plain text meanwhile", async () => {
    // A fresh module, so the lazy chunk isn't already resolved by another test.
    vi.resetModules();
    const { Message: Fresh } = await import("@/components/chat/message");
    const { container } = render(
      <Fresh message={mkMessage("assistant", "**bold** text")} sourcesLabel="" />,
    );
    expect(container.querySelector("p.whitespace-pre-wrap")).toHaveTextContent("**bold** text");
    // A fresh import of the parser chunk can take over findBy's 1 s default when the whole
    // suite runs in parallel (it failed 2 of 3 full runs here), and npm test gates the deploy.
    expect((await screen.findByText("bold", {}, { timeout: 5000 })).tagName).toBe("STRONG");
  });

  it("renders assistant markdown (bold)", async () => {
    render(<Message message={mkMessage("assistant", "**bold** text")} sourcesLabel="Sources" />);
    expect(await screen.findByText("bold")).toBeInTheDocument();
  });

  it("never renders images, and links only to http(s)/mailto", async () => {
    const md =
      "![pixel](https://evil.example/p.png) [site](https://sinaamareh.ir) [mail](mailto:a@b.co) [irc](irc://evil.example) [rel](/x)";
    const { container } = render(
      <Message message={mkMessage("assistant", md)} sourcesLabel="Sources" />,
    );
    await screen.findByRole("link", { name: "site" });
    expect(container.querySelector("img")).toBeNull();
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["https://sinaamareh.ir", "mailto:a@b.co"]);
    expect(container.textContent).toContain("irc"); // the label survives as plain text
  });

  it("shows source chips for assistant messages", () => {
    render(
      <Message
        message={mkMessage("assistant", "hi", [{ source: "CV", section: "Summary" }])}
        sourcesLabel="Sources"
      />,
    );
    expect(screen.getByText("Sources")).toBeInTheDocument();
    expect(screen.getByText("CV")).toBeInTheDocument();
  });

  it("labels source chips in Persian under a Persian answer, project names in Latin", () => {
    const sources = [
      { source: "CV", section: "Summary" },
      { source: "Project: ScrapeGPT", section: "Stack" },
      { source: "Something new", section: "x" },
    ];
    render(<Message message={mkMessage("assistant", "سلام دنیا", sources)} sourcesLabel="منابع" />);
    expect(screen.getByText("رزومه")).toBeInTheDocument();
    expect(screen.getByText("پروژه: ScrapeGPT")).toBeInTheDocument();
    expect(screen.getByText("Something new")).toBeInTheDocument(); // unknown → raw label
  });

  it("keeps code left-to-right inside a Persian answer", async () => {
    const md = "با `C++` کار کردم\n\n```\nx = f(1)\n```";
    const { container } = render(<Message message={mkMessage("assistant", md)} sourcesLabel="" />);
    const inline = await screen.findByText("C++");
    expect(inline).toHaveAttribute("dir", "ltr");
    expect(container.querySelector("pre")).toHaveAttribute("dir", "ltr");
  });

  it("renders Persian assistant text right-to-left", () => {
    const { container } = render(
      <Message message={mkMessage("assistant", "سلام دنیا")} sourcesLabel="Sources" />,
    );
    expect(container.querySelector('[dir="rtl"]')).toBeTruthy();
  });
});
