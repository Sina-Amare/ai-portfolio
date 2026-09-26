import { describe, it, expect } from "vitest";
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

  it("renders assistant markdown (bold)", () => {
    render(<Message message={mkMessage("assistant", "**bold** text")} sourcesLabel="Sources" />);
    expect(screen.getByText("bold")).toBeInTheDocument();
  });

  it("never renders images, and links only to http(s)/mailto", () => {
    const md =
      "![pixel](https://evil.example/p.png) [site](https://sinaamareh.ir) [mail](mailto:a@b.co) [irc](irc://evil.example) [rel](/x)";
    const { container } = render(
      <Message message={mkMessage("assistant", md)} sourcesLabel="Sources" />,
    );
    expect(container.querySelector("img")).toBeNull();
    const hrefs = [...container.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["https://sinaamareh.ir", "mailto:a@b.co"]);
    expect(container.textContent).toContain("irc"); // the label survives as plain text
  });

  it("renders active streaming assistant text without markdown parsing", () => {
    render(
      <Message
        message={mkMessage("assistant", "**bold** text")}
        sourcesLabel="Sources"
        streaming
      />,
    );
    expect(screen.getByText("**bold** text")).toBeInTheDocument();
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

  it("renders Persian assistant text right-to-left", () => {
    const { container } = render(
      <Message message={mkMessage("assistant", "سلام دنیا")} sourcesLabel="Sources" />,
    );
    expect(container.querySelector('[dir="rtl"]')).toBeTruthy();
  });
});
