import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("Vercel deployment configuration", () => {
  it("does not configure Vercel Cron", () => {
    const configPath = resolve(process.cwd(), "apps/web/vercel.json");

    if (!existsSync(configPath)) return;

    const config = JSON.parse(readFileSync(configPath, "utf8")) as Record<string, unknown>;
    expect(config).not.toHaveProperty("crons");
  });

  it("excludes local dependencies and build caches from CLI uploads", () => {
    const ignorePath = resolve(process.cwd(), ".vercelignore");
    expect(existsSync(ignorePath)).toBe(true);

    const patterns = readFileSync(ignorePath, "utf8").split(/\r?\n/);
    expect(patterns).toEqual(
      expect.arrayContaining(["node_modules", ".next", ".turbo", "coverage"]),
    );
  });
});
