/**
 * Renders the Persian link-preview card → app/[lang]/og-fa.png (1200×630).
 *
 * Satori (next/og) shapes Persian letters but lays words out left-to-right and
 * drops ZWNJ, so "سینا عماره" comes out reversed. Chromium gets bidi right, so
 * the Persian card is a committed screenshot instead. Re-run after changing the
 * copy: `node scripts/og-fa.mjs` (needs network for Google Fonts).
 */
import { chromium } from "@playwright/test";

const out = "app/[lang]/og-fa.png";
const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0a0a0b; color: #f6f6f8;
    font-family: Vazirmatn, sans-serif; display: flex; flex-direction: column; justify-content: center;
    padding: 80px; position: relative; }
  body::before { content: ""; position: absolute; inset: 0;
    background: radial-gradient(900px 600px at 15% -10%, rgba(245,181,68,0.38), transparent 60%); }
  .eyebrow { font-size: 30px; font-weight: 700; color: #f5b544; }
  h1 { font-size: 104px; font-weight: 700; margin-top: 18px; line-height: 1.25; }
  p { font-size: 34px; color: #8a8f98; margin-top: 14px; max-width: 960px; line-height: 1.7; }
  .handle { margin-top: 36px; font: 500 26px "JetBrains Mono", monospace; color: #f5b544; direction: ltr; text-align: right; }
</style></head><body>
  <div class="eyebrow">مهندس بک‌اند Python و AI/LLM</div>
  <h1>سینا عماره</h1>
  <p>با Python بک‌اند و برنامه‌های AI می‌سازم. از پروژه‌ها و تجربه‌هام از دستیار سایت بپرس.</p>
  <div class="handle">sina.amareh</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log("saved", out);
