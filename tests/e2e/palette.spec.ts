import { test, expect } from "@playwright/test";

test("command palette opens with Ctrl+K and navigates", async ({ page }) => {
  await page.goto("/");
  // The ⌘K listener is attached on hydration, so a press fired too early is
  // simply dropped. Retry the press until the palette actually opens.
  await expect(async () => {
    await page.keyboard.press("Control+k");
    await expect(page.getByPlaceholder("Type a command or search…")).toBeVisible({
      timeout: 1000,
    });
  }).toPass({ timeout: 15_000 });
  await page.getByRole("option", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test("contact CTA renders on the home page", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /build something together/i }),
  ).toBeVisible();
});
