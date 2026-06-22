import { test, expect, type Page } from "@playwright/test";

function sse(parts: object[]): string {
  return (
    parts.map((p) => `data: ${JSON.stringify(p)}\n\n`).join("") + "data: [DONE]\n\n"
  );
}

const happy = sse([
  { type: "data-sources", id: "sources", data: [{ source: "CV", section: "Summary" }] },
  { type: "text-start", id: "0" },
  { type: "text-delta", id: "0", delta: "I built RAG systems at Dekamond." },
  { type: "text-end", id: "0" },
]);

const refusal = sse([
  { type: "text-start", id: "0" },
  { type: "text-delta", id: "0", delta: "That's a little outside what I can chat about." },
  { type: "text-end", id: "0" },
]);

async function mockChat(page: Page, body: string, status = 200) {
  await page.route("**/api/chat", (route) =>
    route.fulfill({ status, contentType: "text/event-stream", body }),
  );
}

test("happy path: streams a grounded answer with a source chip", async ({ page }) => {
  await mockChat(page, happy);
  await page.goto("/#chat");
  await page.getByRole("button", { name: "What did you build at Dekamond?" }).click();
  await expect(page.getByText("I built RAG systems at Dekamond.")).toBeVisible();
  await expect(page.getByText("CV", { exact: true })).toBeVisible();
});

test("out-of-scope refusal renders cleanly", async ({ page }) => {
  await mockChat(page, refusal);
  await page.goto("/#chat");
  await page.getByRole("button", { name: "What's your strongest tech stack?" }).click();
  await expect(page.getByText(/outside what I can chat about/)).toBeVisible();
});

test("error path surfaces an alert with a retry", async ({ page }) => {
  await page.route("**/api/chat", (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "boom" }),
    }),
  );
  await page.goto("/#chat");
  await page.getByRole("button", { name: "Are you open to new roles?" }).click();
  await expect(page.getByText("Something went wrong.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("language toggle switches the UI and suggestions to Persian", async ({ page }) => {
  await page.goto("/#chat");
  // The site-wide language toggle (nav) also drives the chat hero.
  await page
    .getByRole("group", { name: "Language" })
    .getByRole("button", { name: "فا" })
    .click();
  await expect(
    page.getByRole("button", { name: "تو دکاموند چی ساختی؟" }),
  ).toBeVisible();
});
