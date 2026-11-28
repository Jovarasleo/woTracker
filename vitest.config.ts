import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so tests don't load the PWA and router plugins.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
