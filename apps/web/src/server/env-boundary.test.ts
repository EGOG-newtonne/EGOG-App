import { globSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const envDirectory = resolve(process.cwd(), "apps/web/src/env");

describe("environment module boundary", () => {
  it("marks the server environment module as server-only", () => {
    const source = readFileSync(resolve(envDirectory, "env.server.ts"), "utf8");

    expect(source).toMatch(/^import ["']server-only["'];/m);
  });

  it("keeps server variable names out of the client environment module", () => {
    const source = ["env.client.ts", "env.client.schema.ts"]
      .map((fileName) => readFileSync(resolve(envDirectory, fileName), "utf8"))
      .join("\n");
    const serverOnlyNames = [
      "AWS_SECRET_ACCESS_KEY",
      "CRON_SECRET",
      "DATABASE_DIRECT_URL",
      "DATABASE_URL",
      "GIWA_RELAYER_PRIVATE_KEY",
      "PINATA_JWT",
      "PRIVY_APP_SECRET",
    ];

    for (const variableName of serverOnlyNames) {
      expect(source).not.toContain(variableName);
    }
  });

  it("prevents client components from importing the server environment", () => {
    const sourceFiles = globSync("apps/web/src/**/*.{ts,tsx}", {
      cwd: process.cwd(),
    });

    for (const sourceFile of sourceFiles) {
      const source = readFileSync(resolve(process.cwd(), sourceFile), "utf8");

      if (/^["']use client["'];/m.test(source)) {
        expect(source, sourceFile).not.toMatch(/env\.server/);
      }
    }
  });

  it("keeps every server-only example value empty", () => {
    const source = readFileSync(resolve(process.cwd(), ".env.example"), "utf8");
    const serverAssignments = source
      .split("\n")
      .filter((line) => /^[A-Z][A-Z0-9_]*=/.test(line))
      .filter((line) => !line.startsWith("NEXT_PUBLIC_"));

    for (const assignment of serverAssignments) {
      expect(assignment).toMatch(/=$/);
    }
  });
});
