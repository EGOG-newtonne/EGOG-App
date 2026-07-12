import {
  type AnyPgColumn,
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const projectStatus = pgEnum("project_status", ["active", "coming_soon"]);
export const dataType = pgEnum("data_type", ["demonstration", "actual"]);
export const verificationStage = pgEnum("verification_stage", [
  "PLANNING",
  "MONITORING",
  "VALIDATION",
  "VERIFICATION",
  "ISSUANCE_READY",
  "ISSUED",
]);
export const participationRequestStatus = pgEnum("participation_request_status", [
  "DRAFT",
  "CONSENTED",
  "SIGNED",
  "METADATA_UPLOADED",
  "TX_SUBMITTED",
  "PROCESSING",
  "CONFIRMED",
  "FAILED_RETRYABLE",
  "FAILED_FINAL",
  "EXPIRED",
]);
export const rateLimitKeyType = pgEnum("rate_limit_key_type", [
  "USER",
  "WALLET",
  "IP",
  "GLOBAL",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  privyUserId: text("privy_user_id").unique(),
  email: text("email"),
  walletAddress: varchar("wallet_address", { length: 42 }).notNull().unique(),
  emailOptIn: boolean("email_opt_in").default(false).notNull(),
  emailOptInAt: timestamp("email_opt_in_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  ...timestamps,
});

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  summary: text("summary").notNull(),
  heroImage: text("hero_image").notNull(),
  status: projectStatus("status").notNull(),
  demonstrationNotice: text("demonstration_notice").notNull(),
  badgeImageUri: text("badge_image_uri"),
  currentSnapshotId: uuid("current_snapshot_id").references(
    (): AnyPgColumn => projectSnapshots.id,
    { onDelete: "restrict" },
  ),
  cachedMemberCount: integer("cached_member_count").default(0).notNull(),
  ...timestamps,
});

export const projectSnapshots = pgTable(
  "project_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    version: integer("version").notNull(),
    dataType: dataType("data_type").notNull(),
    verificationStage: verificationStage("verification_stage").notNull(),
    publicData: jsonb("public_data").notNull(),
    canonicalJson: text("canonical_json").notNull(),
    snapshotHash: varchar("snapshot_hash", { length: 66 }).notNull(),
    snapshotUri: text("snapshot_uri").notNull(),
    gatewayUrl: text("gateway_url").notNull(),
    s3BackupKey: text("s3_backup_key").notNull(),
    measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("project_snapshots_project_version_unique").on(
      table.projectId,
      table.version,
    ),
    unique("project_snapshots_hash_unique").on(table.snapshotHash),
    index("project_snapshots_project_idx").on(table.projectId),
  ],
);

export const participationRequests = pgTable(
  "participation_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    idempotencyKey: text("idempotency_key").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "restrict" }),
    snapshotId: uuid("snapshot_id")
      .notNull()
      .references(() => projectSnapshots.id, { onDelete: "restrict" }),
    snapshotHash: varchar("snapshot_hash", { length: 66 }).notNull(),
    snapshotVersion: integer("snapshot_version").notNull(),
    snapshotUri: text("snapshot_uri").notNull(),
    nonce: bigint("nonce", { mode: "bigint" }).notNull(),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    status: participationRequestStatus("status").default("DRAFT").notNull(),
    requiredConsentAt: timestamp("required_consent_at", { withTimezone: true }),
    emailOptIn: boolean("email_opt_in").default(false).notNull(),
    emailOptInAt: timestamp("email_opt_in_at", { withTimezone: true }),
    expectedMemberNumber: bigint("expected_member_number", { mode: "bigint" }),
    tokenUri: text("token_uri"),
    metadataCid: text("metadata_cid"),
    signature: text("signature"),
    transactionHash: varchar("transaction_hash", { length: 66 }),
    lastErrorCode: text("last_error_code"),
    retryCount: integer("retry_count").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    unique("participation_requests_idempotency_unique").on(table.idempotencyKey),
    unique("participation_requests_project_member_unique").on(
      table.projectId,
      table.expectedMemberNumber,
    ),
    index("participation_requests_user_project_idx").on(table.userId, table.projectId),
  ],
);

export const participations = pgTable(
  "participations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => participationRequests.id, { onDelete: "restrict" })
      .unique(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    walletAddress: varchar("wallet_address", { length: 42 }).notNull(),
    projectId: text("project_id").notNull(),
    snapshotId: uuid("snapshot_id").notNull(),
    snapshotHash: varchar("snapshot_hash", { length: 66 }).notNull(),
    snapshotVersion: integer("snapshot_version").notNull(),
    snapshotUri: text("snapshot_uri").notNull(),
    tokenId: bigint("token_id", { mode: "bigint" }).notNull(),
    memberNumber: bigint("member_number", { mode: "bigint" }).notNull(),
    tokenUri: text("token_uri").notNull(),
    transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    logIndex: integer("log_index").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("participations_wallet_project_unique").on(
      table.walletAddress,
      table.projectId,
    ),
    unique("participations_tx_log_unique").on(table.transactionHash, table.logIndex),
  ],
);

export const onchainEvents = pgTable(
  "onchain_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    transactionHash: varchar("transaction_hash", { length: 66 }).notNull(),
    logIndex: integer("log_index").notNull(),
    blockNumber: bigint("block_number", { mode: "bigint" }).notNull(),
    eventName: text("event_name").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("onchain_events_tx_log_unique").on(table.transactionHash, table.logIndex),
  ],
);

export const syncState = pgTable("sync_state", {
  key: text("key").primaryKey(),
  lastSyncedBlock: bigint("last_synced_block", { mode: "bigint" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rateLimitEvents = pgTable(
  "rate_limit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    keyType: rateLimitKeyType("key_type").notNull(),
    keyHash: varchar("key_hash", { length: 64 }).notNull(),
    action: text("action").notNull(),
    blocked: boolean("blocked").default(false).notNull(),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("rate_limit_events_lookup_idx").on(table.keyType, table.keyHash, table.createdAt)],
);
