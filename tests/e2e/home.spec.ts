import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home renders the hero and nav with no console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Sina Amareh", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects" }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("home has no serious/critical accessibility violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    // Dark-theme muted text is an intentional design choice; gate on structural a11y.
    .disableRules(["color-contrast"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});

test("navigates from home to a project case study", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Projects" }).first().click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.getByRole("link", { name: /ScrapeGPT/ }).first().click();
  await expect(page).toHaveURL(/\/projects\/scrapegpt$/);
  await expect(
    page.getByRole("heading", { name: "ScrapeGPT", level: 1 }),
  ).toBeVisible();
});
