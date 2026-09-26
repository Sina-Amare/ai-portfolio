import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChatHero } from "@/components/home/chat-hero";
import { LocaleProvider } from "@/components/locale-provider";
import { track } from "@/lib/analytics/client";
import { ui } from "@/lib/i18n";

let status = "streaming";
const chatting = [
  { id: "u1", role: "user", parts: [{ type: "text", text: "Hi" }] },
  { id: "a1", role: "assistant", parts: [{ type: "text", text: "Hel" }] },
];
let messages = chatting;

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages,
    status,
    sendMessage: vi.fn(),
    stop: vi.fn(),
    regenerate: vi.fn(),
    setMessages: vi.fn(),
  }),
}));
vi.mock("@/lib/analytics/client", () => ({ track: vi.fn() }));

const hero = () => (
  <LocaleProvider locale="en">
    <ChatHero />
  </LocaleProvider>
);

describe("ChatHero", () => {
  it("locks the language switch while an answer streams, since switching remounts the chat", () => {
    const { rerender } = render(hero());
    expect(screen.getByRole("group", { hidden: true })).toHaveAttribute("inert");

    status = "ready";
    rerender(hero());
    expect(screen.getByRole("group")).not.toHaveAttribute("inert");
  });

  it("notes a question as a chip or typed for analytics", () => {
    messages = [];
    status = "ready";
    render(hero());
    fireEvent.click(screen.getByRole("button", { name: ui.en.suggestions[0] }));
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Do you know Go?" } });
    fireEvent.submit(input.closest("form")!);
    expect(vi.mocked(track).mock.calls).toEqual([
      ["chat_ask", "chip"],
      ["chat_ask", "typed"],
    ]);
    messages = chatting;
  });
});
