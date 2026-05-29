import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
  resolve: {
    alias: {
      "@program/shared": new URL("../shared/src/index.ts", import.meta.url).pathname,
      "@program/shared/tasks": new URL("../shared/src/tasks.ts", import.meta.url).pathname,
      "@program/shared/date": new URL("../shared/src/date.ts", import.meta.url).pathname,
      "@program/shared/icons": new URL("../shared/src/icons.ts", import.meta.url).pathname,
    },
  },
});
