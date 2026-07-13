import { readFileSync } from "node:fs";
import { join } from "node:path";

import { readMigrationFiles } from "drizzle-orm/migrator";

export type MigrationHistoryRow = {
  id: number;
  hash: string;
  createdAt: bigint;
};

const expectedTags = [
  "0000_initial",
  "0001_participation-member-reservation",
  "0002_nonce-uint256-storage",
] as const;

export type DrizzleBaselinePlan = {
  createTableSql: string;
  migrations: Array<{
    tag: string;
    hash: string;
    createdAt: number;
  }>;
  rollbackSql: string;
};

export type FinalSchemaInvariants = {
  appTableCount: number;
  badgeImageColumn: boolean;
  memberNumberUniqueConstraint: boolean;
  nonceNumeric78: boolean;
  snapshotMutationTriggers: number;
  rlsEnabledTableCount: number;
};

export function loadDrizzleBaselinePlan(migrationsFolder: string): DrizzleBaselinePlan {
  const journal = JSON.parse(
    readFileSync(join(migrationsFolder, "meta/_journal.json"), "utf8"),
  ) as { entries: Array<{ tag: string }> };
  const tags = journal.entries.map((entry) => entry.tag);

  if (tags.length !== expectedTags.length || tags.some((tag, index) => tag !== expectedTags[index])) {
    throw new Error(
      `Expected only ${expectedTags.join(", ")}; found ${tags.join(", ") || "no migrations"}`,
    );
  }

  const migrationFiles = readMigrationFiles({ migrationsFolder });

  return {
    createTableSql: `CREATE SCHEMA IF NOT EXISTS "drizzle";\nCREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (\n  id SERIAL PRIMARY KEY,\n  hash text NOT NULL,\n  created_at bigint\n);`,
    migrations: migrationFiles.map((migration, index) => ({
      tag: expectedTags[index],
      hash: migration.hash,
      createdAt: migration.folderMillis,
    })),
    rollbackSql: 'DROP SCHEMA "drizzle" CASCADE;',
  };
}

export function assertBaselineHistoryIsEmpty(rows: MigrationHistoryRow[]): void {
  if (rows.length > 0) {
    throw new Error(
      `Refusing to baseline: drizzle.__drizzle_migrations already contains ${rows.length} row${rows.length === 1 ? "" : "s"}`,
    );
  }
}

export function assertFinalSchemaMatchesBaseline(
  invariants: FinalSchemaInvariants,
): void {
  const expected: FinalSchemaInvariants = {
    appTableCount: 8,
    badgeImageColumn: true,
    memberNumberUniqueConstraint: true,
    nonceNumeric78: true,
    snapshotMutationTriggers: 2,
    rlsEnabledTableCount: 8,
  };

  for (const key of Object.keys(expected) as Array<keyof FinalSchemaInvariants>) {
    if (invariants[key] !== expected[key]) {
      throw new Error(
        `Refusing to baseline: ${key} expected ${String(expected[key])}, found ${String(invariants[key])}`,
      );
    }
  }
}

export function assertMigrationHistoryMatchesPlan(
  plan: DrizzleBaselinePlan,
  rows: MigrationHistoryRow[],
): void {
  if (rows.length !== plan.migrations.length) {
    throw new Error(
      `Expected ${plan.migrations.length} migration history rows, found ${rows.length}`,
    );
  }

  const orderedRows = [...rows].sort((left, right) =>
    left.createdAt < right.createdAt ? -1 : left.createdAt > right.createdAt ? 1 : 0,
  );

  plan.migrations.forEach((migration, index) => {
    const row = orderedRows[index];
    if (row.hash !== migration.hash || row.createdAt !== BigInt(migration.createdAt)) {
      throw new Error(
        `Migration history mismatch for ${migration.tag}: expected ${migration.hash}/${migration.createdAt}, found ${row.hash}/${String(row.createdAt)}`,
      );
    }
  });
}
