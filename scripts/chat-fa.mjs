import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1100, height: 1000 },
  reducedMotion: "reduce",
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 160));
});

await page.goto("http://localhost:3000/#chat", { waitUntil: "networkidle" });
await page.waitForTimeout(700);

await page.getByRole("button", { name: "فا" }).click();
await page.waitForTimeout(300);
await page.getByRole("button", { name: "تو دکاموند چی ساختی؟" }).click();

await page
  .waitForFunction(() => document.body.innerText.includes("Kaleri"), {
    timeout: 25000,
  })
  .catch(() => {});
await page.waitForTimeout(4000);

await page.screenshot({ path: "shot-fa.png" });
console.log("errors:", JSON.stringify(errors.slice(0, 5)));
await browser.close();
