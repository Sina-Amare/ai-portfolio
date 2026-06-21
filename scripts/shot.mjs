import { chromium } from "@playwright/test";

const url = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "shot.png";
const full = process.argv[4] !== "viewport";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text().slice(0, 160));
});

await page.goto(url, { waitUntil: "networkidle" });

// Real wheel scroll so IntersectionObserver reveals fire.
const height = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < height; y += 600) {
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(130);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);

await page.screenshot({ path: out, fullPage: full });
console.log("ERRORS:", errors.length ? JSON.stringify(errors.slice(0, 5)) : "none");
await browser.close();
