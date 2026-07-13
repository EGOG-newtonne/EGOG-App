import { describe, expect, it } from "vitest";

import { isAuthorizedOnchainSyncRequest } from "./authorization";

describe("on-chain sync authorization", () => {
  const secret = "example-onchain-sync-secret-with-32-characters";

  it("accepts the exact Bearer secret", () => {
    const request = new Request("https://egog.example/api/cron/sync-onchain", {
      headers: { authorization: `Bearer ${secret}` },
    });

    expect(isAuthorizedOnchainSyncRequest(request, secret)).toBe(true);
  });

  it.each([
    undefined,
    "",
    "Basic credentials",
    "Bearer wrong-secret",
    `bearer ${secret}`,
  ])("rejects a missing or non-exact Authorization header: %s", (authorization) => {
    const request = new Request(
      "https://egog.example/api/cron/sync-onchain",
      authorization === undefined ? undefined : { headers: { authorization } },
    );

    expect(isAuthorizedOnchainSyncRequest(request, secret)).toBe(false);
  });
});
