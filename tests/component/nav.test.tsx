import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Nav } from "@/components/nav";
import { CommandPalette } from "@/components/command-palette";
import { LocaleProvider } from "@/components/locale-provider";
import { dict } from "@/lib/dictionary";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn(), resolvedTheme: "dark" }) }));
vi.mock("@/lib/analytics/client", () => ({ track: vi.fn(), linkEvent: vi.fn() }));

describe("Nav", () => {
  it("closes the mobile menu on Escape and returns focus to its button", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="en">
        <Nav />
      </LocaleProvider>,
    );
    await user.click(screen.getByRole("button", { name: dict.en.nav.openMenu }));
    const toggle = screen.getByRole("button", { name: dict.en.nav.closeMenu });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("the mobile menu's Search hands focus back to the menu button when the palette closes", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="en">
        <Nav />
        <CommandPalette />
      </LocaleProvider>,
    );
    const toggle = screen.getByRole("button", { name: dict.en.nav.openMenu });
    await user.click(toggle);
    // The desktop search button shares the name; the mobile one comes last.
    await user.click(screen.getAllByRole("button", { name: dict.en.nav.command }).at(-1)!);
    expect(await screen.findByPlaceholderText(dict.en.command.placeholder)).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(toggle).toHaveFocus();
  });
});
