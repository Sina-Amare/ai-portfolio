import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home renders the hero and nav with no console errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Ask me anything/i, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText("Sina Amareh").first()).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Projects" }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("home has no serious/critical accessibility violations", async ({
  page,
}) => {
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
  // The nav's "Projects" scrolls to the #work section; that section's
  // "All projects" button is what opens the full index.
  await page.getByRole("link", { name: "All projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page
    .getByRole("link", { name: /ScrapeGPT/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects\/scrapegpt$/);
  await expect(
    page.getByRole("heading", { name: "ScrapeGPT", level: 1 }),
  ).toBeVisible();
});

// Every nav item targets a home-page section, so none of them should hard-jump.
test("nav 'Projects' scrolls to the work section instead of leaving the page", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Projects", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work")).toBeInViewport();
});

test("nav 'Home' scrolls back to the top rather than snapping", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Contact", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/#contact$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(100);

  await page.getByRole("link", { name: "Home", exact: true }).first().click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
});

test("workplace agents have a home preview and detailed, source-free project entries", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#workplace article")).toHaveCount(2);
  await page.getByRole("link", { name: "Explore the work projects" }).click();
  await expect(page).toHaveURL(/\/projects#workplace$/);
  const cards = page.locator("#workplace article");
  await expect(cards).toHaveCount(2);
  await expect(cards.first().getByText("The important decision")).toBeVisible();
  await expect(
    cards.first().getByText("Search the right sources"),
  ).toBeVisible();
  await expect(cards.nth(1).getByText("Learn from the review")).toBeVisible();
  await expect(
    cards.nth(1).getByRole("heading", { name: "What changed" }),
  ).toBeVisible();
  await expect(cards.locator("a")).toHaveCount(0);
});

test("Persian copy covers workplace agents, image captions, and privacy", async ({
  page,
}) => {
  await page.goto("/projects");
  await page.getByRole("button", { name: "فا", exact: true }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page).toHaveTitle(/پروژه‌ها/);
  await expect(
    page.getByRole("heading", { name: "ایجنت رصد شبکه‌های اجتماعی" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "ایجنت‌های تحلیل و گزارش‌گیری" }),
  ).toBeVisible();
  await expect(page.getByText("از نظر مدیر یاد می‌گیره")).toBeVisible();

  await page.goto("/projects/scrapegpt");
  await page
    .getByRole("button", { name: /۹۶ ردیف دادهٔ تمیز/ })
    .first()
    .click();
  await expect(page.getByText(/۹۶ ردیف دادهٔ تمیز/).last()).toBeVisible();

  await page.goto("/privacy");
  await expect(page).toHaveTitle(/حریم خصوصی/);
  await expect(
    page.getByRole("heading", { name: "این سایت از بازدیدها چی می‌فهمه؟" }),
  ).toBeVisible();
});
