import { describe, expect, it } from "vitest";

import { hashRateLimitKey, rateLimitLockId } from "./hash-rate-key";

describe("rate-limit key protection", () => {
  it("uses a secret-keyed digest rather than storing raw identifiers", () => {
    const first = hashRateLimitKey("secret-a", "person@example.com");
    const second = hashRateLimitKey("secret-b", "person@example.com");
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain("person@example.com");
    expect(first).not.toBe(second);
  });

  it("derives a deterministic signed bigint advisory-lock id", () => {
    const digest = hashRateLimitKey("secret-a", "wallet");
    expect(rateLimitLockId(digest)).toBe(rateLimitLockId(digest));
    expect(typeof rateLimitLockId(digest)).toBe("bigint");
  });
});
