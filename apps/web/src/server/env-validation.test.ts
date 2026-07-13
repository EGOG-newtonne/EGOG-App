import { describe, expect, it } from "vitest";

import { parseClientEnvironment } from "../env/env.client.schema";
import { parseServerEnvironment } from "../env/env.server.schema";

const validServerEnvironment = {
  AWS_ACCESS_KEY_ID: "AKIAIOSFODNN7EXAMPLE",
  AWS_REGION: "ap-northeast-2",
  AWS_S3_BUCKET: "egog-dev-private-data",
  AWS_SECRET_ACCESS_KEY: "example-secret-access-key-with-32-chars",
  ONCHAIN_SYNC_SECRET: "example-onchain-sync-secret-with-at-least-32-characters",
  DATABASE_DIRECT_URL: "postgresql://postgres:password@db.example.com:5432/postgres",
  DATABASE_URL: "postgresql://postgres:password@pooler.example.com:6543/postgres",
  GIWA_CHAIN_ID: "91342",
  GIWA_RELAYER_PRIVATE_KEY: `0x${"1".repeat(64)}`,
  GIWA_RPC_URL: "https://rpc.example.com",
  PARTICIPATION_CONTRACT_ADDRESS: `0x${"2".repeat(40)}`,
  PINATA_JWT: "header.payload.signature",
  PRIVY_APP_SECRET: "example-privy-app-secret",
};

const validClientEnvironment = {
  NEXT_PUBLIC_APP_ENV: "development",
  NEXT_PUBLIC_GIWA_CHAIN_ID: "91342",
  NEXT_PUBLIC_GIWA_EXPLORER_URL: "https://explorer.example.com",
  NEXT_PUBLIC_GIWA_RPC_URL: "https://rpc.example.com",
  NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS: `0x${"2".repeat(40)}`,
  NEXT_PUBLIC_PINATA_GATEWAY_URL: "https://egog.mypinata.cloud",
  NEXT_PUBLIC_PRIVY_APP_ID: "example-privy-app-id",
};

describe("server environment contract", () => {
  it("parses all required server-only values", () => {
    const result = parseServerEnvironment(validServerEnvironment);

    expect(result.GIWA_CHAIN_ID).toBe(91342);
    expect(result.DATABASE_URL).toContain(":6543/");
  });

  it("names every missing variable without printing secret values", () => {
    const invalidEnvironment = {
      ...validServerEnvironment,
      ONCHAIN_SYNC_SECRET: "do-not-log-this-secret",
      PRIVY_APP_SECRET: undefined,
    };

    expect(() => parseServerEnvironment(invalidEnvironment)).toThrowError(
      /PRIVY_APP_SECRET/,
    );

    try {
      parseServerEnvironment(invalidEnvironment);
    } catch (error) {
      expect(String(error)).not.toContain("do-not-log-this-secret");
    }
  });

  it("rejects malformed URLs, keys, addresses, and chain IDs", () => {
    expect(() =>
      parseServerEnvironment({
        ...validServerEnvironment,
        DATABASE_URL: "not-a-postgres-url",
        GIWA_CHAIN_ID: "1",
        GIWA_RELAYER_PRIVATE_KEY: "not-a-private-key",
        PARTICIPATION_CONTRACT_ADDRESS: "not-an-address",
      }),
    ).toThrowError(
      /DATABASE_URL.*GIWA_CHAIN_ID.*GIWA_RELAYER_PRIVATE_KEY.*PARTICIPATION_CONTRACT_ADDRESS/s,
    );
  });

  it("rejects swapped Supabase runtime and migration ports", () => {
    expect(() =>
      parseServerEnvironment({
        ...validServerEnvironment,
        DATABASE_DIRECT_URL:
          "postgresql://postgres:password@db.example.com:6543/postgres",
        DATABASE_URL:
          "postgresql://postgres:password@pooler.example.com:5432/postgres",
      }),
    ).toThrowError(/DATABASE_DIRECT_URL.*DATABASE_URL/s);
  });
});

describe("client environment contract", () => {
  it("parses only NEXT_PUBLIC variables", () => {
    const result = parseClientEnvironment(validClientEnvironment);

    expect(Object.keys(result).every((key) => key.startsWith("NEXT_PUBLIC_"))).toBe(
      true,
    );
    expect(result.NEXT_PUBLIC_GIWA_CHAIN_ID).toBe(91342);
  });

  it("rejects a malformed public contract address", () => {
    expect(() =>
      parseClientEnvironment({
        ...validClientEnvironment,
        NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS: "0x1234",
      }),
    ).toThrowError(/NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS/);
  });
});
