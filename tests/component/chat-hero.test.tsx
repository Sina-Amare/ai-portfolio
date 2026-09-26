import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatHero } from "@/components/home/chat-hero";
import { LocaleProvider } from "@/components/locale-provider";

let status = "streaming";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [
      { id: "u1", role: "user", parts: [{ type: "text", text: "Hi" }] },
      { id: "a1", role: "assistant", parts: [{ type: "text", text: "Hel" }] },
    ],
    status,
    sendMessage: vi.fn(),
    stop: vi.fn(),
    regenerate: vi.fn(),
    setMessages: vi.fn(),
  }),
}));

describe("ChatHero", () => {
  it("locks the language switch while an answer streams, since switching remounts the chat", () => {
    const hero = () => (
      <LocaleProvider locale="en">
        <ChatHero />
      </LocaleProvider>
    );
    const { rerender } = render(hero());
    expect(screen.getByRole("group", { hidden: true })).toHaveAttribute("inert");

    status = "ready";
    rerender(hero());
    expect(screen.getByRole("group")).not.toHaveAttribute("inert");
  });
});
