import { describe, expect, it } from "vitest";

import {
  ONCHAIN_SYNC_CRON_NAME,
  ONCHAIN_SYNC_SCHEDULE,
  buildOnchainSyncCronCommand,
} from "./supabase-cron";

describe("Supabase on-chain recovery Cron", () => {
  it("calls the protected Production endpoint every 10 minutes using Vault values", () => {
    const command = buildOnchainSyncCronCommand();

    expect(ONCHAIN_SYNC_CRON_NAME).toBe("egog-onchain-sync-recovery");
    expect(ONCHAIN_SYNC_SCHEDULE).toBe("*/10 * * * *");
    expect(command).toContain("net.http_get");
    expect(command).toContain("egog_onchain_sync_url");
    expect(command).toContain("egog_onchain_sync_secret");
    expect(command).toContain("'Authorization', 'Bearer ' ||");
    expect(command).toContain("timeout_milliseconds := 30000");
  });

  it("does not embed a deployment URL or secret value in the scheduled command", () => {
    const command = buildOnchainSyncCronCommand();

    expect(command).not.toContain("egog-app-web.vercel.app");
    expect(command).not.toContain("example-onchain-sync-secret");
  });
});
