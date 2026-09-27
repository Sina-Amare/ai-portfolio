import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Vitest keeps an inherited NODE_ENV, and the Vercel build (vercel.json runs the
// tests before `next build`) may export "production": React's production build
// and the production-only guards would then fail tests that pass on a laptop.
Object.assign(process.env, { NODE_ENV: "test" });

// The Vercel build also hands the tests the production env: Redis, Telegram and
// LLM credentials, the admin password, tuned limits. A set limit flips test
// expectations (a red deploy), and a test missing a mock would hit live services.
// So drop every variable .env.example documents, plus any Redis REST credential
// under the prefixed names lib/analytics/store.ts discovers; tests stub what
// they need with vi.stubEnv.
const documented = new Set(
  [...readFileSync(resolve(__dirname, ".env.example"), "utf8").matchAll(/^#?\s*([A-Z]\w*)=/gm)].map(
    (m) => m[1],
  ),
);
for (const name of Object.keys(process.env)) {
  if (
    documented.has(name) ||
    /REST(_API)?_(URL|TOKEN)$/.test(name) ||
    name === "VERCEL_PROJECT_PRODUCTION_URL"
  ) {
    delete process.env[name];
  }
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/component/**/*.test.{ts,tsx}"],
    // A cold import of a lazy chunk (cmdk, react-markdown) can take seconds on a busy
    // build machine, and `npm test` gates the Vercel deploy — so a slow run must not
    // fail it. Pairs with asyncUtilTimeout in vitest.setup.ts.
    testTimeout: 20_000,
  },
});
