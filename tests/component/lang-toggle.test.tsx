import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LangToggle } from "@/components/chat/lang-toggle";

describe("LangToggle", () => {
  it("renders both languages and calls onChange when switching", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<LangToggle lang="en" onChange={onChange} />);

    expect(screen.getByText("EN")).toBeInTheDocument();
    const fa = screen.getByText("فا");
    expect(fa).toBeInTheDocument();

    await user.click(fa);
    expect(onChange).toHaveBeenCalledWith("fa");
  });

  it("marks the active language with aria-pressed", () => {
    render(<LangToggle lang="fa" onChange={() => {}} />);
    expect(screen.getByText("فا").closest("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
