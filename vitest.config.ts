import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    environment: "node",
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      include: ["src/core/**", "src/sources/D365FOBridge.ts", "src/templates/**"],
      reporter: ["text", "json-summary"],
    },
  },
});
