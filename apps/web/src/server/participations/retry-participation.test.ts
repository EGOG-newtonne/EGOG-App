import { describe, expect, it } from "vitest";

import { decideParticipationRecovery } from "./retry-participation";

const now = new Date("2026-07-13T00:00:00.000Z");
const future = new Date("2026-07-13T00:10:00.000Z");
const past = new Date("2026-07-12T23:59:00.000Z");

describe("decideParticipationRecovery", () => {
  it("resumes metadata publication without reserving a new member number", () => {
    expect(decideParticipationRecovery({
      status: "FAILED_RETRYABLE",
      tokenUri: null,
      signature: null,
      transactionHash: null,
      deadline: future,
      expiresAt: future,
      retryCount: 1,
    }, now)).toBe("RETRY_METADATA");
  });

  it("reuses the existing signature and token URI for a relayer retry", () => {
    expect(decideParticipationRecovery({
      status: "FAILED_RETRYABLE",
      tokenUri: "ipfs://metadata",
      signature: "0xsigned",
      transactionHash: "0xfailed",
      deadline: future,
      expiresAt: future,
      retryCount: 1,
    }, now)).toBe("RETRY_TRANSACTION");
  });

  it("polls a submitted transaction instead of asking for another signature", () => {
    expect(decideParticipationRecovery({
      status: "TX_SUBMITTED",
      tokenUri: "ipfs://metadata",
      signature: "0xsigned",
      transactionHash: "0xpending",
      deadline: past,
      expiresAt: future,
      retryCount: 0,
    }, now)).toBe("POLL_TRANSACTION");
  });

  it("resubmits a signed request if the process stopped before a transaction hash was saved", () => {
    expect(decideParticipationRecovery({
      status: "SIGNED",
      tokenUri: "ipfs://metadata",
      signature: "0xsigned",
      transactionHash: null,
      deadline: future,
      expiresAt: future,
      retryCount: 0,
    }, now)).toBe("RETRY_TRANSACTION");
  });

  it("refreshes an unsigned challenge after ten minutes while the request is within 24 hours", () => {
    expect(decideParticipationRecovery({
      status: "METADATA_UPLOADED",
      tokenUri: "ipfs://metadata",
      signature: null,
      transactionHash: null,
      deadline: past,
      expiresAt: future,
      retryCount: 0,
    }, now)).toBe("REFRESH_CHALLENGE");
  });

  it("expires an unsigned request only after its 24-hour lifetime", () => {
    expect(decideParticipationRecovery({
      status: "METADATA_UPLOADED",
      tokenUri: "ipfs://metadata",
      signature: null,
      transactionHash: null,
      deadline: past,
      expiresAt: past,
      retryCount: 0,
    }, now)).toBe("EXPIRE_UNSIGNED");
  });

  it("stops retrying an expired signed request or one that exhausted retries", () => {
    expect(decideParticipationRecovery({
      status: "FAILED_RETRYABLE",
      tokenUri: "ipfs://metadata",
      signature: "0xsigned",
      transactionHash: "0xfailed",
      deadline: past,
      expiresAt: future,
      retryCount: 1,
    }, now)).toBe("FAIL_FINAL");

    expect(decideParticipationRecovery({
      status: "FAILED_RETRYABLE",
      tokenUri: "ipfs://metadata",
      signature: "0xsigned",
      transactionHash: "0xfailed",
      deadline: future,
      expiresAt: future,
      retryCount: 3,
    }, now)).toBe("FAIL_FINAL");
  });
});
