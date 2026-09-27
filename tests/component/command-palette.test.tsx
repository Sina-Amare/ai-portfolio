import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "@/components/command-palette";
import { LocaleProvider } from "@/components/locale-provider";
import { dict } from "@/lib/dictionary";

const body = vi.hoisted(() => ({ loaded: false }));
vi.mock("@/components/command-palette-body", async (importOriginal) => {
  body.loaded = true;
  return importOriginal();
});
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("next-themes", () => ({ useTheme: () => ({ setTheme: vi.fn(), resolvedTheme: "dark" }) }));
vi.mock("@/lib/analytics/client", () => ({ track: vi.fn(), linkEvent: vi.fn() }));

describe("CommandPalette", () => {
  it("loads the palette (cmdk) only when it first opens, behind a backdrop meanwhile", async () => {
    render(
      <LocaleProvider locale="en">
        <CommandPalette />
      </LocaleProvider>,
    );
    expect(body.loaded).toBe(false);
    const loading = () => document.querySelector("[data-palette-loading]");
    act(() => void window.dispatchEvent(new Event("toggle-command")));
    // cmdk is still on its way: the backdrop shows at once; a click or Escape cancels.
    fireEvent.click(loading()!);
    expect(loading()).toBeNull();
    act(() => void window.dispatchEvent(new Event("toggle-command")));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(loading()).toBeNull();

    act(() => void window.dispatchEvent(new Event("toggle-command")));
    expect(loading()).not.toBeNull();
    expect(await screen.findByRole("dialog", { name: dict.en.nav.command })).toBeInTheDocument();
    expect(loading()).toBeNull();
    expect(body.loaded).toBe(true);
  });

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

    expect(await screen.findByRole("dialog", { name: dict.en.nav.command })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(dict.en.command.placeholder)).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(opener).toHaveFocus();
  });

  it("ignores Ctrl+K while a native modal dialog (the gallery lightbox) is open", async () => {
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="en">
        <dialog open>
          <button type="button">inside lightbox</button>
        </dialog>
        <CommandPalette />
      </LocaleProvider>,
    );
    screen.getByRole("button", { name: "inside lightbox" }).focus();
    await user.keyboard("{Control>}k{/Control}");
    expect(screen.queryByPlaceholderText(dict.en.command.placeholder)).toBeNull();
  });
});
