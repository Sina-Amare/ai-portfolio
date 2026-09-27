import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Vitest keeps an inherited NODE_ENV, and the Vercel build (vercel.json runs the
// tests before `next build`) may export "production": React's production build
// and the production-only guards would then fail tests that pass on a laptop.
Object.assign(process.env, { NODE_ENV: "test" });

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
  },
});
