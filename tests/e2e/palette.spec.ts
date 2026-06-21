import { test, expect } from "@playwright/test";

test("command palette opens with Ctrl+K and navigates", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await expect(
    page.getByPlaceholder("Type a command or search…"),
  ).toBeVisible();
  await page.getByRole("option", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
});

test("contact CTA renders on the home page", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /build something together/i }),
  ).toBeVisible();
});
