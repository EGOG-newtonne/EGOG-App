import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import {
  assertBaselineHistoryIsEmpty,
  assertFinalSchemaMatchesBaseline,
  assertMigrationHistoryMatchesPlan,
  loadDrizzleBaselinePlan,
} from "./drizzle-baseline";

describe("Drizzle migration baseline plan", () => {
  test("uses the exact hashes and timestamps from migration SQL and journal metadata", () => {
    const plan = loadDrizzleBaselinePlan(resolve("apps/web/drizzle"));

    expect(plan.migrations).toEqual([
      {
        tag: "0000_initial",
        hash: "a7558fe8a2a364948b049e8aa04f1754e7f71904ce3e674773932d914540a2f9",
        createdAt: 1_783_868_603_636,
      },
      {
        tag: "0001_participation-member-reservation",
        hash: "d99d760656f15537251a0e8311100663d92717a932f17a0879452bd5b84000e2",
        createdAt: 1_783_869_354_923,
      },
      {
        tag: "0002_nonce-uint256-storage",
        hash: "2f4ea1a2ff48580f39f2e8026dfdf8dfa6d3c2f24e626b8bf1bf029c32977232",
        createdAt: 1_783_872_348_147,
      },
    ]);
    expect(plan.createTableSql).toContain(
      'CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations"',
    );
    expect(plan.rollbackSql).toBe('DROP SCHEMA "drizzle" CASCADE;');
  });

  test("refuses to baseline when any migration history already exists", () => {
    expect(() =>
      assertBaselineHistoryIsEmpty([
        {
          id: 1,
          hash: "existing",
          createdAt: 1n,
        },
      ]),
    ).toThrow("already contains 1 row");
  });

  test("refuses to baseline when a required final-schema invariant is missing", () => {
    expect(() =>
      assertFinalSchemaMatchesBaseline({
        appTableCount: 8,
        badgeImageColumn: true,
        memberNumberUniqueConstraint: false,
        nonceNumeric78: true,
        snapshotMutationTriggers: 2,
        rlsEnabledTableCount: 8,
      }),
    ).toThrow("memberNumberUniqueConstraint");
  });

  test("requires every inserted migration row to match the plan", () => {
    const plan = loadDrizzleBaselinePlan(resolve("apps/web/drizzle"));

    expect(() =>
      assertMigrationHistoryMatchesPlan(plan, [
        {
          id: 1,
          hash: plan.migrations[0].hash,
          createdAt: BigInt(plan.migrations[0].createdAt),
        },
      ]),
    ).toThrow("Expected 3 migration history rows, found 1");
  });
});
