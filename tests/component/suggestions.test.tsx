import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Suggestions } from "@/components/chat/suggestions";

describe("Suggestions", () => {
  it("renders all items and calls onPick with the chosen text", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    const items = ["What's your stack?", "Are you available?"];
    render(<Suggestions items={items} onPick={onPick} dir="ltr" />);

    for (const item of items) {
      expect(screen.getByRole("button", { name: item })).toBeInTheDocument();
    }

    await user.click(screen.getByRole("button", { name: items[0] }));
    expect(onPick).toHaveBeenCalledWith(items[0]);
  });
});
