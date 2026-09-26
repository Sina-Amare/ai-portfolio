import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/home/contact-form";
import { LocaleProvider } from "@/components/locale-provider";
import { dict } from "@/lib/dictionary";

vi.mock("@/lib/analytics/client", () => ({ track: vi.fn() }));

afterEach(() => {
  vi.unstubAllGlobals();
});

const f = dict.en.contact.form;

describe("ContactForm", () => {
  it("keeps keyboard focus: on the field to fix, then on the sent confirmation", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ ok: true })),
    );
    const user = userEvent.setup();
    render(
      <LocaleProvider locale="en">
        <ContactForm />
      </LocaleProvider>,
    );
    const name = screen.getByPlaceholderText(f.namePh);
    await user.click(screen.getByRole("button", { name: f.send }));
    expect(name).toHaveFocus();

    await user.type(name, "Ada");
    await user.type(screen.getByPlaceholderText(f.emailPh), "ada@example.com");
    await user.type(screen.getByPlaceholderText(f.messagePh), "Hello");
    await user.click(screen.getByRole("button", { name: f.send }));
    expect(await screen.findByRole("status")).toHaveFocus();
  });
});
