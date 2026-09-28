import { beforeEach, describe, it, expect, vi } from "vitest";
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
const regenerate = vi.fn();
let chatOptions: { experimental_throttle?: number } = {};
const setMessages = vi.fn((m: typeof messages) => {
  messages = m;
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@ai-sdk/react", () => ({
  useChat: (options: typeof chatOptions) => {
    chatOptions = options;
    return { messages, status, sendMessage: vi.fn(), stop: vi.fn(), regenerate, setMessages };
  },
}));
vi.mock("@/lib/analytics/client", () => ({ track: vi.fn() }));

const hero = () => (
  <LocaleProvider locale="en">
    <ChatHero />
  </LocaleProvider>
);

describe("ChatHero", () => {
  // A saved chat would be restored through setMessages and leak between tests.
  beforeEach(() => sessionStorage.clear());

  it("locks the language switch while an answer streams, since switching remounts the chat", () => {
    const { rerender } = render(hero());
    expect(screen.getByRole("group", { hidden: true })).toHaveAttribute("inert");

    status = "ready";
    rerender(hero());
    expect(screen.getByRole("group")).not.toHaveAttribute("inert");
  });

  it("says under the chat box that chats are kept 30 days, with the privacy page a click away", () => {
    status = "ready";
    const { unmount } = render(hero());
    expect(screen.getByText(/Chats are saved for 30 days/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    unmount();

    messages = [];
    render(
      <LocaleProvider locale="fa">
        <ChatHero />
      </LocaleProvider>,
    );
    expect(screen.getByText(/گفت‌وگوها ۳۰ روز نگه داشته می‌شن/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "حریم خصوصی" })).toHaveAttribute("href", "/fa/privacy");
    messages = chatting;
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

  it("retries a failed answer on its own once, then leaves it to the visitor", () => {
    regenerate.mockClear();
    status = "error";
    const { rerender } = render(hero());
    expect(regenerate).toHaveBeenCalledTimes(1);

    status = "submitted";
    rerender(hero());
    status = "error";
    rerender(hero());
    expect(regenerate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("saves the conversation only once an answer finished cleanly", () => {
    status = "error";
    const { rerender } = render(hero());
    expect(sessionStorage.getItem("sina-chat:v1")).toBeNull();

    status = "ready";
    rerender(hero());
    expect(sessionStorage.getItem("sina-chat:v1")).toContain("Hel");
  });

  it("announces Thinking, then holds the answer until it finished streaming", () => {
    status = "submitted";
    const { rerender } = render(hero());
    expect(screen.getByRole("status")).toHaveTextContent(ui.en.thinking);

    status = "streaming";
    rerender(hero());
    expect(screen.getByRole("log")).toHaveAttribute("aria-busy", "true");
  });

  it("renders the streaming answer as markdown, with throttled updates", async () => {
    status = "streaming";
    messages = [chatting[0], { ...chatting[1], parts: [{ type: "text", text: "**Hel**" }] }];
    render(hero());
    // react-markdown is a lazy import: under a full, parallel run it can take
    // longer than findByText's 1 s default, and vercel.json runs these tests.
    expect((await screen.findByText("Hel", {}, { timeout: 3000 })).tagName).toBe("STRONG");
    expect(chatOptions.experimental_throttle).toBeGreaterThan(0);
    messages = chatting;
  });

  it("keeps a page h1 once the headline collapses into the chat", () => {
    render(hero());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(ui.en.heroHeadline);
  });

  it("hands keyboard focus to the empty input after New chat", () => {
    status = "ready";
    const { rerender } = render(hero());
    fireEvent.click(screen.getByRole("button", { name: ui.en.newChat }));
    rerender(hero());
    expect(screen.getByRole("textbox")).toHaveFocus();
    messages = chatting;
  });
});
