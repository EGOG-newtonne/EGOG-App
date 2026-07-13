import { createHash } from "node:crypto";
import { resolve } from "node:path";

import {
  assertBaselineHistoryIsEmpty,
  assertFinalSchemaMatchesBaseline,
  assertMigrationHistoryMatchesPlan,
  loadDrizzleBaselinePlan,
  type FinalSchemaInvariants,
  type MigrationHistoryRow,
} from "./drizzle-baseline.js";

const appTables = [
  "users",
  "projects",
  "project_snapshots",
  "participation_requests",
  "participations",
  "onchain_events",
  "sync_state",
  "rate_limit_events",
] as const;

type SqlClient = ReturnType<
  typeof import("../apps/web/src/server/db/factory.js").createDatabase
>["sql"];

type DatabaseSnapshot = {
  rowCounts: Record<string, number>;
  catalogHash: string;
  indexCount: number;
  constraintCount: number;
};

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function parseArguments(): { apply: boolean } {
  const unknown = process.argv.slice(2).filter((argument) => argument !== "--apply");
  if (unknown.length > 0) throw new Error(`Unknown argument: ${unknown.join(", ")}`);
  return { apply: process.argv.includes("--apply") };
}

async function migrationHistory(sql: SqlClient): Promise<MigrationHistoryRow[]> {
  const [{ tableName }] = await sql<Array<{ tableName: string | null }>>`
    select to_regclass('drizzle.__drizzle_migrations')::text as "tableName"
  `;
  if (!tableName) return [];

  const rows = await sql<Array<{ id: number; hash: string; createdAt: string }>>`
    select id, hash, created_at::text as "createdAt"
    from drizzle.__drizzle_migrations
    order by created_at asc
  `;
  return rows.map((row) => ({
    id: row.id,
    hash: row.hash,
    createdAt: BigInt(row.createdAt),
  }));
}

async function schemaInvariants(sql: SqlClient): Promise<FinalSchemaInvariants> {
  const [result] = await sql<Array<{
    appTableCount: number;
    badgeImageColumn: boolean;
    memberNumberUniqueConstraint: boolean;
    nonceNumeric78: boolean;
    snapshotMutationTriggers: number;
    rlsEnabledTableCount: number;
  }>>`
    select
      (select count(*)::int from information_schema.tables
        where table_schema = 'public' and table_name = any(${appTables as unknown as string[]})) as "appTableCount",
      exists(select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'projects'
          and column_name = 'badge_image_uri' and data_type = 'text') as "badgeImageColumn",
      exists(select 1 from pg_constraint c
        join pg_class t on t.oid = c.conrelid
        join pg_namespace n on n.oid = t.relnamespace
        where n.nspname = 'public' and t.relname = 'participation_requests'
          and c.conname = 'participation_requests_project_member_unique'
          and c.contype = 'u') as "memberNumberUniqueConstraint",
      exists(select 1 from information_schema.columns
        where table_schema = 'public' and table_name = 'participation_requests'
          and column_name = 'nonce' and data_type = 'numeric'
          and numeric_precision = 78 and numeric_scale = 0) as "nonceNumeric78",
      (select count(*)::int from information_schema.triggers
        where event_object_schema = 'public' and event_object_table = 'project_snapshots') as "snapshotMutationTriggers",
      (select count(*)::int from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = any(${appTables as unknown as string[]})
          and c.relrowsecurity) as "rlsEnabledTableCount"
  `;
  return result;
}

async function databaseSnapshot(sql: SqlClient): Promise<DatabaseSnapshot> {
  const rowCounts: Record<string, number> = {};
  for (const table of appTables) {
    const [{ count }] = await sql.unsafe<Array<{ count: number }>>(
      `select count(*)::int as count from public."${table}"`,
    );
    rowCounts[table] = count;
  }

  const [columns, indexes, constraints, triggers, rls] = await Promise.all([
    sql`
      select table_name, column_name, ordinal_position, data_type, udt_name,
        is_nullable, column_default, character_maximum_length, numeric_precision, numeric_scale
      from information_schema.columns
      where table_schema = 'public' and table_name = any(${appTables as unknown as string[]})
      order by table_name, ordinal_position
    `,
    sql`
      select tablename, indexname, indexdef
      from pg_indexes
      where schemaname = 'public' and tablename = any(${appTables as unknown as string[]})
      order by tablename, indexname
    `,
    sql`
      select t.relname as table_name, c.conname, c.contype, pg_get_constraintdef(c.oid) as definition
      from pg_constraint c
      join pg_class t on t.oid = c.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public' and t.relname = any(${appTables as unknown as string[]})
      order by t.relname, c.conname
    `,
    sql`
      select event_object_table, trigger_name, event_manipulation, action_timing, action_statement
      from information_schema.triggers
      where event_object_schema = 'public' and event_object_table = any(${appTables as unknown as string[]})
      order by event_object_table, trigger_name, event_manipulation
    `,
    sql`
      select c.relname as table_name, c.relrowsecurity, c.relforcerowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = any(${appTables as unknown as string[]})
      order by c.relname
    `,
  ]);

  const catalog = { columns, indexes, constraints, triggers, rls };
  return {
    rowCounts,
    catalogHash: createHash("sha256").update(JSON.stringify(catalog)).digest("hex"),
    indexCount: indexes.length,
    constraintCount: constraints.length,
  };
}

function assertSnapshotUnchanged(before: DatabaseSnapshot, after: DatabaseSnapshot): void {
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error("Public schema or application row counts changed during baseline");
  }
}

async function main(): Promise<void> {
  const { apply } = parseArguments();
  const plan = loadDrizzleBaselinePlan(resolve("apps/web/drizzle"));
  const [{ createDatabase }] = await Promise.all([
    import("../apps/web/src/server/db/factory.js"),
  ]);
  const database = createDatabase(required("DATABASE_URL"));

  try {
    const currentHistory = await migrationHistory(database.sql);
    assertBaselineHistoryIsEmpty(currentHistory);
    const invariants = await schemaInvariants(database.sql);
    assertFinalSchemaMatchesBaseline(invariants);
    const before = await databaseSnapshot(database.sql);

    const preview = {
      mode: apply ? "apply" : "dry-run",
      purpose: "restore Drizzle migration history only; do not create or alter application schema",
      createHistoryTableSql: plan.createTableSql,
      migrations: plan.migrations,
      publicSchemaEvidence: before,
      rollbackSql: plan.rollbackSql,
    };
    console.log(JSON.stringify(preview, null, 2));

    if (!apply) return;

    await database.sql.begin(async (transaction) => {
      const historyInsideTransaction = await migrationHistory(transaction as SqlClient);
      assertBaselineHistoryIsEmpty(historyInsideTransaction);
      assertFinalSchemaMatchesBaseline(await schemaInvariants(transaction as SqlClient));

      await transaction.unsafe(plan.createTableSql);
      for (const migration of plan.migrations) {
        await transaction`
          insert into drizzle.__drizzle_migrations (hash, created_at)
          values (${migration.hash}, ${migration.createdAt})
        `;
      }

      assertMigrationHistoryMatchesPlan(
        plan,
        await migrationHistory(transaction as SqlClient),
      );
      assertSnapshotUnchanged(before, await databaseSnapshot(transaction as SqlClient));
    });

    const finalHistory = await migrationHistory(database.sql);
    assertMigrationHistoryMatchesPlan(plan, finalHistory);
    assertSnapshotUnchanged(before, await databaseSnapshot(database.sql));
    console.log(JSON.stringify({ result: "PASS", insertedMigrationRows: finalHistory.length }));
  } finally {
    await database.sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Drizzle baseline failed");
  process.exitCode = 1;
});
