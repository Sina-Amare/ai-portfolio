import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1100, height: 1000 },
  reducedMotion: "reduce",
});
const page = await ctx.newPage();
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));

await page.goto("http://localhost:3000/#chat", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

const chip = page.getByRole("button", {
  name: process.argv[2] ?? "What did you build at Dekamond?",
});
await chip.click();

// Wait until the ASSISTANT answer (not the echoed question) has streamed in.
await page
  .waitForFunction(
    () => {
      const t = document.body.innerText;
      return t.includes("Kaleri") || t.includes("automation") || t.includes("cost");
    },
    { timeout: 25000 },
  )
  .catch(() => {});
await page.waitForTimeout(3500);

await page.locator("#chat").scrollIntoViewIfNeeded();
await page.screenshot({ path: process.argv[3] ?? "shot-chat.png" });
console.log("errors:", JSON.stringify(errors.slice(0, 10)));
await browser.close();
