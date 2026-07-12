import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  onchainEvents,
  participationRequests,
  participations,
  projectSnapshots,
  projects,
  rateLimitEvents,
  syncState,
  users,
} from "./schema";

describe("database schema", () => {
  it("defines every MVP table", () => {
    expect(
      [
        users,
        projects,
        projectSnapshots,
        participationRequests,
        participations,
        onchainEvents,
        syncState,
        rateLimitEvents,
      ].map((table) => getTableConfig(table).name),
    ).toEqual([
      "users",
      "projects",
      "project_snapshots",
      "participation_requests",
      "participations",
      "onchain_events",
      "sync_state",
      "rate_limit_events",
    ]);
  });

  it("enforces immutable identities and idempotency with unique constraints", () => {
    const uniqueNames = [
      ...getTableConfig(projectSnapshots).uniqueConstraints,
      ...getTableConfig(participationRequests).uniqueConstraints,
      ...getTableConfig(participations).uniqueConstraints,
      ...getTableConfig(onchainEvents).uniqueConstraints,
    ].map((constraint) => constraint.getName());

    expect(uniqueNames).toEqual(
      expect.arrayContaining([
        "project_snapshots_project_version_unique",
        "participation_requests_idempotency_unique",
        "participations_wallet_project_unique",
        "onchain_events_tx_log_unique",
      ]),
    );
  });

  it("includes 24-hour request expiry and state columns", () => {
    const columns = getTableConfig(participationRequests).columns.map(
      (column) => column.name,
    );
    expect(columns).toEqual(
      expect.arrayContaining(["status", "deadline", "expires_at", "nonce"]),
    );
  });
});
