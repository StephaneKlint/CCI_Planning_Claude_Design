import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // domain.ts tests are pure Node — no browser APIs needed.
    // Component tests (Jalon 2+) will use jsdom via per-file env overrides.
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.test.ts", "**/*.test.ts"],
    exclude: ["node_modules", ".next"],
  },
});
