import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    exclude: ["dist/**", "dist-cli/**", "site-dist/**", "node_modules/**", "e2e/**"],
  },
});
