import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/analytics/login-form";
import { pageCopy } from "@/lib/page-copy";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/components/locale-provider", () => ({ useLocale: () => ({ locale: "en" }) }));

const t = pageCopy.en.admin;

async function submitWith(res: Response) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => res),
  );
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText(t.password), "correct-horse");
  await user.click(screen.getByRole("button", { name: t.signIn }));
  return screen.findByRole("alert");
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("LoginForm", () => {
  it("gives password managers a username and a current-password field", () => {
    const { container } = render(<LoginForm />);
    expect(screen.getByLabelText(t.password)).toHaveAttribute("autocomplete", "current-password");
    expect(container.querySelector('input[autocomplete="username"]')).toHaveValue("admin");
  });

  it("says 'wrong password' only for a 401", async () => {
    const alert = await submitWith(Response.json({ error: "invalid" }, { status: 401 }));
    expect(alert).toHaveTextContent(t.wrongPassword);
  });

  it("shows a server error, not 'wrong password', when the server fails", async () => {
    const alert = await submitWith(new Response("Internal Server Error", { status: 500 }));
    expect(alert).toHaveTextContent(t.serverError);
    expect(alert).not.toHaveTextContent(t.wrongPassword);
  });
});
