import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

const attr = (page: Page, selector: string, name = "content") =>
  page.locator(selector).first().getAttribute(name);

test("each page declares its own canonical, hreflang set, and link preview", async ({ page }) => {
  await page.goto("/projects/scrapegpt");
  const canonical = await attr(page, 'link[rel="canonical"]', "href");
  expect(canonical).toMatch(/\/projects\/scrapegpt$/);
  expect(await attr(page, 'link[hreflang="en"]', "href")).toBe(canonical);
  expect(await attr(page, 'link[hreflang="x-default"]', "href")).toBe(canonical);
  expect(await attr(page, 'link[hreflang="fa"]', "href")).toMatch(/\/fa\/projects\/scrapegpt$/);
  expect(await attr(page, 'meta[property="og:url"]')).toBe(canonical);
  expect(await attr(page, 'meta[property="og:locale"]')).toBe("en_US");
  expect(await attr(page, 'meta[property="og:image"]')).toMatch(/\/opengraph-image$/);
  expect(await attr(page, 'meta[name="twitter:title"]')).toBe("ScrapeGPT — Sina Amareh");

  await page.goto("/fa/projects/scrapegpt");
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(await attr(page, 'link[rel="canonical"]', "href")).toMatch(/\/fa\/projects\/scrapegpt$/);
  expect(await attr(page, 'meta[property="og:locale"]')).toBe("fa_IR");
  expect(await attr(page, 'meta[property="og:image"]')).toMatch(/\/fa\/opengraph-image$/);
  // Persian pages write the name in Persian; the Latin one stays the logo.
  await expect(page).toHaveTitle("ScrapeGPT — سینا آماره");
  expect(await attr(page, 'meta[name="twitter:title"]')).toBe("ScrapeGPT — سینا آماره");
  await expect(page.locator("footer")).toContainText(/© [۰-۹]{4} سینا آماره/);
});

test("the language toggle keeps the section, remembers the choice, and Back returns", async ({
  page,
  context,
}) => {
  await page.goto("/projects#workplace");
  await page
    .getByRole("group", { name: "Language" })
    .first()
    .getByRole("link", { name: "فا" })
    .click();
  await expect(page).toHaveURL(/\/fa\/projects#workplace$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fa");
  const cookies = await context.cookies();
  expect(cookies.find((c) => c.name === "locale")?.value).toBe("fa");

  await page.goBack();
  await expect(page).toHaveURL(/\/projects#workplace$/);
  await expect(page).not.toHaveURL(/\/fa\//);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("/en URLs redirect permanently to the unprefixed canonical", async ({ request }) => {
  const res = await request.get("/en/projects?x=1", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers().location).toMatch(/^(https?:\/\/[^/]+)?\/projects\?x=1$/);
});

test("unknown pages 404 inside the right language", async ({ page }) => {
  const en = await page.goto("/nope");
  expect(en?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  const fa = await page.goto("/fa/nope");
  expect(fa?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "این صفحه پیدا نشد" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test.describe("a Persian browser on its first visit", () => {
  test.use({ locale: "fa-IR", userAgent: CHROME_UA });

  test("lands on /fa, unless it already chose English", async ({ page, context }) => {
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/fa\/projects$/);

    await context.addCookies([{ name: "locale", value: "en", url: new URL("/", page.url()).href }]);
    await page.goto("/projects");
    await expect(page).toHaveURL(/\/projects$/);
    await expect(page).not.toHaveURL(/\/fa\//);
  });
});

test("/fa has no serious or critical accessibility violations", async ({ page }) => {
  await page.goto("/fa");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .disableRules(["color-contrast"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(serious).toEqual([]);
});
