import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    projects: [
      {
        test: {
          environment: "jsdom",
          include: ["apps/web/src/{app,components,features}/**/*.test.{ts,tsx}"],
          name: "web",
        },
      },
      {
        test: {
          environment: "node",
          include: ["apps/web/src/server/**/*.test.ts"],
          name: "server",
        },
      },
      {
        test: {
          environment: "node",
          include: ["packages/shared/src/**/*.test.ts"],
          name: "shared",
        },
      },
    ],
  },
});

