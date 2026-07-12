import { describe, expect, test } from "vitest";

import {
  buildParticipationTypedData,
  buildSerializableParticipationTypedData,
  hashParticipationTypedData,
  participationTypes,
} from "./participation.js";

const devContract = "0x1111111111111111111111111111111111111111" as const;
const demoContract = "0x2222222222222222222222222222222222222222" as const;

const message = {
  participant: "0x3333333333333333333333333333333333333333",
  projectId: `0x${"44".repeat(32)}`,
  snapshotHash: `0x${"55".repeat(32)}`,
  snapshotVersion: 3n,
  snapshotURI: "ipfs://snapshot-v3",
  memberNumber: 9n,
  tokenURI: "ipfs://badge-9",
  nonce: 7n,
  deadline: 1_800_000_000n,
} as const;

describe("Participation EIP-712 definition", () => {
  test("keeps the approved Participation field order", () => {
    expect(participationTypes.Participation.map(({ name }) => name)).toEqual([
      "participant",
      "projectId",
      "snapshotHash",
      "snapshotVersion",
      "snapshotURI",
      "memberNumber",
      "tokenURI",
      "nonce",
      "deadline",
    ]);
  });

  test("produces the same digest for identical input", () => {
    const first = hashParticipationTypedData(devContract, message);
    const second = hashParticipationTypedData(devContract, { ...message });

    expect(first).toBe(second);
  });

  test("changes the digest when any signed data changes", () => {
    const original = hashParticipationTypedData(devContract, message);
    const changed = hashParticipationTypedData(devContract, {
      ...message,
      snapshotVersion: 4n,
    });

    expect(changed).not.toBe(original);
  });

  test("separates Dev and Demo signatures by verifying contract", () => {
    expect(hashParticipationTypedData(devContract, message)).not.toBe(
      hashParticipationTypedData(demoContract, message),
    );
  });

  test("builds the approved domain and GIWA chain ID", () => {
    const typedData = buildParticipationTypedData(devContract, message);

    expect(typedData.domain).toEqual({
      name: "EGOG Participation",
      version: "1",
      chainId: 91_342,
      verifyingContract: devContract,
    });
    expect(typedData.primaryType).toBe("Participation");
  });

  test("builds JSON-serializable typed data for wallet SDKs", () => {
    const typedData = buildSerializableParticipationTypedData(
      devContract,
      message,
    );

    expect(() => JSON.stringify(typedData)).not.toThrow();
    expect(typedData.message).toMatchObject({
      snapshotVersion: "3",
      memberNumber: "9",
      nonce: "7",
      deadline: "1800000000",
    });
  });
});
