# EGOG Demo Drizzle Migration Baseline Evidence

## Purpose and safety boundary

- Target: Supabase `EGOG Demo` (`zxruwjprnubdgiqmsnzi`)
- Captured at: `2026-07-13T06:53:25Z`
- Installed migration runtime: `drizzle-orm@0.45.2`
- Purpose: restore the history of migrations that are already present in the database schema.
- This is **not** a schema migration. The process must not create, alter, or delete any application table, column, index, constraint, trigger, policy, or row.
- The database URL and credentials are intentionally absent from this evidence.

## Pre-baseline state

`drizzle.__drizzle_migrations` did not exist. The final schema invariants for migrations `0000` through `0002` all passed:

- 8 application tables exist.
- `projects.badge_image_uri` exists as `text`.
- `participation_requests_project_member_unique` exists as a unique constraint.
- `participation_requests.nonce` is `numeric(78,0)`.
- Both immutable Snapshot triggers exist.
- RLS is enabled for all 8 application tables.

### Application row counts

| Table | Rows |
| --- | ---: |
| `users` | 2 |
| `projects` | 3 |
| `project_snapshots` | 3 |
| `participation_requests` | 2 |
| `participations` | 2 |
| `onchain_events` | 2 |
| `sync_state` | 1 |
| `rate_limit_events` | 55 |

### Catalog fingerprint

- Public application catalog SHA-256: `be9b28771bc7a74eb9b472fd2d5887c70076088ee629d3760266a5984f40ae13`
- Indexes: 22
- Constraints: 26
- Snapshot mutation triggers: 2
- RLS-enabled application tables: 8

The reusable Baseline command calculates this fingerprint from ordered column, index, constraint, trigger, and RLS catalog queries and requires it and every application row count to remain identical inside the Baseline transaction and after commit.

### Tables and columns

- `users`: `id`, `privy_user_id`, `email`, `wallet_address`, `email_opt_in`, `email_opt_in_at`, `deleted_at`, `created_at`, `updated_at`
- `projects`: `id`, `slug`, `name`, `location`, `summary`, `hero_image`, `status`, `demonstration_notice`, `current_snapshot_id`, `cached_member_count`, `created_at`, `updated_at`, `badge_image_uri`
- `project_snapshots`: `id`, `project_id`, `version`, `data_type`, `verification_stage`, `public_data`, `canonical_json`, `snapshot_hash`, `snapshot_uri`, `gateway_url`, `s3_backup_key`, `measured_at`, `published_at`, `created_at`
- `participation_requests`: `id`, `idempotency_key`, `user_id`, `wallet_address`, `project_id`, `snapshot_id`, `snapshot_hash`, `snapshot_version`, `snapshot_uri`, `nonce`, `deadline`, `expires_at`, `status`, `required_consent_at`, `email_opt_in`, `email_opt_in_at`, `expected_member_number`, `token_uri`, `metadata_cid`, `signature`, `transaction_hash`, `last_error_code`, `retry_count`, `created_at`, `updated_at`
- `participations`: `id`, `request_id`, `user_id`, `wallet_address`, `project_id`, `snapshot_id`, `snapshot_hash`, `snapshot_version`, `snapshot_uri`, `token_id`, `member_number`, `token_uri`, `transaction_hash`, `block_number`, `log_index`, `joined_at`, `created_at`
- `onchain_events`: `id`, `transaction_hash`, `log_index`, `block_number`, `event_name`, `payload`, `created_at`
- `sync_state`: `key`, `last_synced_block`, `updated_at`
- `rate_limit_events`: `id`, `key_type`, `key_hash`, `action`, `blocked`, `reason`, `created_at`

### Indexes

- `onchain_events`: `onchain_events_pkey`, `onchain_events_tx_log_unique`
- `participation_requests`: `participation_requests_idempotency_unique`, `participation_requests_pkey`, `participation_requests_project_member_unique`, `participation_requests_user_project_idx`
- `participations`: `participations_pkey`, `participations_request_id_unique`, `participations_tx_log_unique`, `participations_wallet_project_unique`
- `project_snapshots`: `project_snapshots_hash_unique`, `project_snapshots_pkey`, `project_snapshots_project_idx`, `project_snapshots_project_version_unique`
- `projects`: `projects_pkey`, `projects_slug_unique`
- `rate_limit_events`: `rate_limit_events_lookup_idx`, `rate_limit_events_pkey`
- `sync_state`: `sync_state_pkey`
- `users`: `users_pkey`, `users_privy_user_id_unique`, `users_wallet_address_unique`

### Constraints

- `onchain_events`: `onchain_events_pkey`, `onchain_events_tx_log_unique`
- `participation_requests`: `participation_requests_idempotency_unique`, `participation_requests_pkey`, `participation_requests_project_id_projects_id_fk`, `participation_requests_project_member_unique`, `participation_requests_snapshot_id_project_snapshots_id_fk`, `participation_requests_user_id_users_id_fk`
- `participations`: `participations_pkey`, `participations_request_id_participation_requests_id_fk`, `participations_request_id_unique`, `participations_tx_log_unique`, `participations_user_id_users_id_fk`, `participations_wallet_project_unique`
- `project_snapshots`: `project_snapshots_hash_unique`, `project_snapshots_pkey`, `project_snapshots_project_id_projects_id_fk`, `project_snapshots_project_version_unique`
- `projects`: `projects_current_snapshot_id_project_snapshots_id_fk`, `projects_pkey`, `projects_slug_unique`
- `rate_limit_events`: `rate_limit_events_pkey`
- `sync_state`: `sync_state_pkey`
- `users`: `users_pkey`, `users_privy_user_id_unique`, `users_wallet_address_unique`

### Triggers and RLS

- `project_snapshots_reject_delete` on `DELETE`
- `project_snapshots_reject_update` on `UPDATE`
- RLS enabled: `users`, `projects`, `project_snapshots`, `participation_requests`, `participations`, `onchain_events`, `sync_state`, `rate_limit_events`

## Exact migration metadata

The hashes are SHA-256 values of the unmodified migration SQL files. The timestamps come from `apps/web/drizzle/meta/_journal.json`.

| Migration | SHA-256 | Journal timestamp |
| --- | --- | ---: |
| `0000_initial` | `a7558fe8a2a364948b049e8aa04f1754e7f71904ce3e674773932d914540a2f9` | `1783868603636` |
| `0001_participation-member-reservation` | `d99d760656f15537251a0e8311100663d92717a932f17a0879452bd5b84000e2` | `1783869354923` |
| `0002_nonce-uint256-storage` | `2f4ea1a2ff48580f39f2e8026dfdf8dfa6d3c2f24e626b8bf1bf029c32977232` | `1783872348147` |

## Secret-free apply preview

```sql
BEGIN;

CREATE SCHEMA IF NOT EXISTS "drizzle";
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);

INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
VALUES
  ('a7558fe8a2a364948b049e8aa04f1754e7f71904ce3e674773932d914540a2f9', 1783868603636),
  ('d99d760656f15537251a0e8311100663d92717a932f17a0879452bd5b84000e2', 1783869354923),
  ('2f4ea1a2ff48580f39f2e8026dfdf8dfa6d3c2f24e626b8bf1bf029c32977232', 1783872348147);

-- The implementation rechecks the three inserted rows, all row counts,
-- and the complete public catalog fingerprint before COMMIT.
COMMIT;
```

## Recovery state

- The entire operation runs in one PostgreSQL transaction; any error rolls back the history schema and all three history rows together.
- No existing application object or row is modified, so the pre-baseline catalog and row-count evidence above is the recovery reference.
- Before any future migration is applied, the exact reversal is:

```sql
DROP SCHEMA "drizzle" CASCADE;
```

That reversal removes only the restored Drizzle history and leaves the existing `public` schema and its data unchanged.

## Execution status

- Unit tests: PASS (`4/4`)
- ESLint for Baseline implementation: PASS
- Secret-free dry-run: PASS
- Baseline apply: PASS; exactly three history rows were inserted in one transaction.
- Post-commit invariants: PASS; all application row counts, 22 indexes, 26 constraints, two immutable Snapshot triggers, eight RLS flags, and catalog fingerprint remained unchanged.
- Migration no-op verification: PASS; `pnpm db:migrate` did not replay `0000` through `0002`, and the exact three history rows and application invariants remained unchanged.
- `verify:demo`: PASS; three projects, three Snapshots, current Snapshot v3, Demo Contract `0xf06aDA399160D208D3629EBeEAAF628266BE23A6`, and DB/on-chain member count `2` were verified.
- Repository verification: PASS; lint, typecheck, 27 Vitest files / 93 tests, Production build, and the Baseline target tests passed.
- Vercel Production `DATABASE_URL`: updated as a Sensitive Production-only value without logging the credential.
- Production deployment: READY (`dpl_AHFHo5ScjkNMka78GU4fKJ5WaLkV`).
- Public Production smoke: PASS; `/`, Vietnam Brick Project Detail, `/privacy`, `/terms`, and `/api/projects` returned HTTP 200; the API returned three projects and the Vietnam Brick cached member count `2`.
- Authenticated Production smoke: PASS; Google OAuth restored the existing Badge #1 embedded wallet, the Account Menu opened without changing authentication, Escape closed only the menu and returned focus to its trigger, and My Participation showed wallet `0x7599…C954`, Early Participant #1, Snapshot v3, Token ID 1, the immutable metadata URI, the GIWA transaction, and the public Snapshot link.
- Destructive-action guard: PASS; Delete Account opened the warning dialog, clearly described possible wallet-access loss and permanent public blockchain/Badge retention, and cancellation preserved the session. No account or participation was deleted during this smoke test.

## Post-baseline revalidation

- Revalidated at: `2026-07-13T07:35:03Z`
- Target: Supabase `EGOG Demo` (`zxruwjprnubdgiqmsnzi`)
- Migration history: PASS; exactly three rows remain and every hash/timestamp still matches the local SQL files and Drizzle journal.
- `pnpm db:migrate`: PASS; the command used the Demo Session Pooler on port `5432`, emitted only the expected existing-schema/history-table notices, and did not replay application migration SQL.
- Public catalog: PASS; the SHA-256 fingerprint remains `be9b28771bc7a74eb9b472fd2d5887c70076088ee629d3760266a5984f40ae13`, with 22 indexes, 26 constraints, two Snapshot mutation triggers, and RLS enabled on all eight application tables.
- Application data: PASS; the pre/post no-op check remained identical at 5 users, 3 projects, 3 Snapshots, 5 participation requests, 5 participations, 5 on-chain events, 1 sync cursor, and 76 rate-limit events.
- `verify:demo`: PASS; three projects, three Snapshots, current Snapshot v3, Demo Contract `0xf06aDA399160D208D3629EBeEAAF628266BE23A6`, and DB/on-chain member count `5` were verified.
- Credentials: the Demo database password and connection strings were injected only into process environment variables and were not written to this document or command output.
