import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 120_000, // e2e tests may npm-install packages
    hookTimeout: 30_000,
  },
});
