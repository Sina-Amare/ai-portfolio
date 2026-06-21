import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "@/components/chat/chat-input";

function setup(overrides: { value?: string; isStreaming?: boolean } = {}) {
  const onSubmit = vi.fn();
  const onChange = vi.fn();
  const onStop = vi.fn();
  render(
    <ChatInput
      value={overrides.value ?? ""}
      onChange={onChange}
      onSubmit={onSubmit}
      onStop={onStop}
      isStreaming={overrides.isStreaming ?? false}
      placeholder="Ask…"
      dir="ltr"
      sendLabel="Send"
      stopLabel="Stop"
    />,
  );
  return { onSubmit, onChange, onStop };
}

describe("ChatInput", () => {
  it("submits on Enter", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup({ value: "hi" });
    await user.type(screen.getByLabelText("Ask…"), "{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not submit on Shift+Enter", async () => {
    const user = userEvent.setup();
    const { onSubmit } = setup({ value: "hi" });
    await user.type(screen.getByLabelText("Ask…"), "{Shift>}{Enter}{/Shift}");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the send button when empty", () => {
    setup({ value: "" });
    expect(screen.getByLabelText("Send")).toBeDisabled();
  });

  it("shows the Stop button (not Send) while streaming", () => {
    const { onStop } = setup({ value: "hi", isStreaming: true });
    expect(screen.getByLabelText("Stop")).toBeInTheDocument();
    expect(screen.queryByLabelText("Send")).not.toBeInTheDocument();
    expect(onStop).not.toHaveBeenCalled();
  });
});
