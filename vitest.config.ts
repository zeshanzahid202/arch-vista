import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve("src"),
      "server-only": path.resolve("tests/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    testTimeout: 60000,
    hookTimeout: 120000,
    fileParallelism: false,
    experimental: {
      fsModuleCache: true,
      fsModuleCachePath: path.resolve(".local/vitest-cache"),
    },
  },
});
