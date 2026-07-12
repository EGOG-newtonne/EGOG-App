CREATE TYPE "public"."data_type" AS ENUM('demonstration', 'actual');--> statement-breakpoint
CREATE TYPE "public"."participation_request_status" AS ENUM('DRAFT', 'CONSENTED', 'SIGNED', 'METADATA_UPLOADED', 'TX_SUBMITTED', 'PROCESSING', 'CONFIRMED', 'FAILED_RETRYABLE', 'FAILED_FINAL', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('active', 'coming_soon');--> statement-breakpoint
CREATE TYPE "public"."rate_limit_key_type" AS ENUM('USER', 'WALLET', 'IP', 'GLOBAL');--> statement-breakpoint
CREATE TYPE "public"."verification_stage" AS ENUM('PLANNING', 'MONITORING', 'VALIDATION', 'VERIFICATION', 'ISSUANCE_READY', 'ISSUED');--> statement-breakpoint
CREATE TABLE "onchain_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_hash" varchar(66) NOT NULL,
	"log_index" integer NOT NULL,
	"block_number" bigint NOT NULL,
	"event_name" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "onchain_events_tx_log_unique" UNIQUE("transaction_hash","log_index")
);
--> statement-breakpoint
CREATE TABLE "participation_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idempotency_key" text NOT NULL,
	"user_id" uuid,
	"wallet_address" varchar(42) NOT NULL,
	"project_id" text NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"snapshot_hash" varchar(66) NOT NULL,
	"snapshot_version" integer NOT NULL,
	"snapshot_uri" text NOT NULL,
	"nonce" bigint NOT NULL,
	"deadline" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "participation_request_status" DEFAULT 'DRAFT' NOT NULL,
	"required_consent_at" timestamp with time zone,
	"email_opt_in" boolean DEFAULT false NOT NULL,
	"email_opt_in_at" timestamp with time zone,
	"expected_member_number" bigint,
	"token_uri" text,
	"metadata_cid" text,
	"signature" text,
	"transaction_hash" varchar(66),
	"last_error_code" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participation_requests_idempotency_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
CREATE TABLE "participations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"user_id" uuid,
	"wallet_address" varchar(42) NOT NULL,
	"project_id" text NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"snapshot_hash" varchar(66) NOT NULL,
	"snapshot_version" integer NOT NULL,
	"snapshot_uri" text NOT NULL,
	"token_id" bigint NOT NULL,
	"member_number" bigint NOT NULL,
	"token_uri" text NOT NULL,
	"transaction_hash" varchar(66) NOT NULL,
	"block_number" bigint NOT NULL,
	"log_index" integer NOT NULL,
	"joined_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "participations_request_id_unique" UNIQUE("request_id"),
	CONSTRAINT "participations_wallet_project_unique" UNIQUE("wallet_address","project_id"),
	CONSTRAINT "participations_tx_log_unique" UNIQUE("transaction_hash","log_index")
);
--> statement-breakpoint
CREATE TABLE "project_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" text NOT NULL,
	"version" integer NOT NULL,
	"data_type" "data_type" NOT NULL,
	"verification_stage" "verification_stage" NOT NULL,
	"public_data" jsonb NOT NULL,
	"canonical_json" text NOT NULL,
	"snapshot_hash" varchar(66) NOT NULL,
	"snapshot_uri" text NOT NULL,
	"gateway_url" text NOT NULL,
	"s3_backup_key" text NOT NULL,
	"measured_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "project_snapshots_project_version_unique" UNIQUE("project_id","version"),
	CONSTRAINT "project_snapshots_hash_unique" UNIQUE("snapshot_hash")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"location" text NOT NULL,
	"summary" text NOT NULL,
	"hero_image" text NOT NULL,
	"status" "project_status" NOT NULL,
	"demonstration_notice" text NOT NULL,
	"current_snapshot_id" uuid,
	"cached_member_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rate_limit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_type" "rate_limit_key_type" NOT NULL,
	"key_hash" varchar(64) NOT NULL,
	"action" text NOT NULL,
	"blocked" boolean DEFAULT false NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_state" (
	"key" text PRIMARY KEY NOT NULL,
	"last_synced_block" bigint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"privy_user_id" text,
	"email" text,
	"wallet_address" varchar(42) NOT NULL,
	"email_opt_in" boolean DEFAULT false NOT NULL,
	"email_opt_in_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_privy_user_id_unique" UNIQUE("privy_user_id"),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
--> statement-breakpoint
ALTER TABLE "participation_requests" ADD CONSTRAINT "participation_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_requests" ADD CONSTRAINT "participation_requests_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation_requests" ADD CONSTRAINT "participation_requests_snapshot_id_project_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."project_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_request_id_participation_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."participation_requests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participations" ADD CONSTRAINT "participations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_snapshots" ADD CONSTRAINT "project_snapshots_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_current_snapshot_id_project_snapshots_id_fk" FOREIGN KEY ("current_snapshot_id") REFERENCES "public"."project_snapshots"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "participation_requests_user_project_idx" ON "participation_requests" USING btree ("user_id","project_id");--> statement-breakpoint
CREATE INDEX "project_snapshots_project_idx" ON "project_snapshots" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "rate_limit_events_lookup_idx" ON "rate_limit_events" USING btree ("key_type","key_hash","created_at");
--> statement-breakpoint
CREATE OR REPLACE FUNCTION "reject_project_snapshot_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
	RAISE EXCEPTION 'project snapshots are immutable; insert a new version';
END;
$$;
--> statement-breakpoint
CREATE TRIGGER "project_snapshots_reject_update"
BEFORE UPDATE ON "project_snapshots"
FOR EACH ROW EXECUTE FUNCTION "reject_project_snapshot_mutation"();
--> statement-breakpoint
CREATE TRIGGER "project_snapshots_reject_delete"
BEFORE DELETE ON "project_snapshots"
FOR EACH ROW EXECUTE FUNCTION "reject_project_snapshot_mutation"();
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "project_snapshots" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "participation_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "participations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "onchain_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sync_state" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "rate_limit_events" ENABLE ROW LEVEL SECURITY;
