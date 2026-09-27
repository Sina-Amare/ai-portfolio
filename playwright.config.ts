import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. The LLM is ALWAYS mocked via page.route() in specs, so no API keys
 * are needed and tests are fully deterministic.
 *
 * PORT moves the dev server and the tests together (next dev reads it too): on
 * Windows, Hyper-V can reserve 3000, e.g. `PORT=3100 npm run test:e2e`.
 */
const baseURL = `http://localhost:${process.env.PORT ?? 3000}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
