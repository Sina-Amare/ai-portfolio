import { describe, it, expect, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "@/components/command-palette";
import { LocaleProvider } from "@/components/locale-provider";
import { dict } from "@/lib/dictionary";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn(), resolvedTheme: "dark" }) }));
vi.mock("@/lib/analytics/client", () => ({ track: vi.fn(), linkEvent: vi.fn() }));

describe("CommandPalette", () => {
  it("opens as a modal dialog and gives focus back to what opened it", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="en">
        <button type="button">opener</button>
        <CommandPalette />
      </LocaleProvider>,
    );
    const opener = screen.getByRole("button", { name: "opener" });
    opener.focus();
    act(() => void window.dispatchEvent(new Event("toggle-command")));

    expect(screen.getByRole("dialog", { name: dict.en.nav.command })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(dict.en.command.placeholder)).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });
});
