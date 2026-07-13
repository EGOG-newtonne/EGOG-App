import { beforeEach, describe, expect, it, vi } from "vitest";

import { enforceParticipationRateLimits } from "./limiter";

const databaseMocks = vi.hoisted(() => ({
  execute: vi.fn(),
  from: vi.fn(),
  insert: vi.fn(),
  select: vi.fn(),
  total: 0,
  transaction: vi.fn(),
  values: vi.fn(),
  where: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("../db/client", () => ({
  db: { transaction: databaseMocks.transaction },
}));

vi.mock("../../env/env.server", () => ({
  serverEnvironment: { ONCHAIN_SYNC_SECRET: "test-rate-limit-secret" },
}));

describe("participation rate limiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    databaseMocks.total = 0;
    databaseMocks.where.mockImplementation(async () => [
      { total: databaseMocks.total },
    ]);
    databaseMocks.from.mockReturnValue({ where: databaseMocks.where });
    databaseMocks.select.mockReturnValue({ from: databaseMocks.from });
    databaseMocks.values.mockResolvedValue(undefined);
    databaseMocks.insert.mockReturnValue({ values: databaseMocks.values });
    databaseMocks.transaction.mockImplementation(async (callback) =>
      callback({
        execute: databaseMocks.execute,
        insert: databaseMocks.insert,
        select: databaseMocks.select,
      }),
    );
  });

  it.each(["USER", "WALLET", "IP", "GLOBAL"] as const)(
    "blocks and records the %s limit",
    async (keyType) => {
      databaseMocks.total = 3;

      await expect(
        enforceParticipationRateLimits([
          { keyType, maximum: 3, value: `${keyType}-value`, windowMs: 60_000 },
        ]),
      ).rejects.toThrow(`${keyType}_RATE_LIMIT`);

      expect(databaseMocks.values).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "participation_challenge",
          blocked: true,
          keyType,
          reason: `${keyType}_RATE_LIMIT`,
        }),
      );
    },
  );

  it("records an allowed event below the configured maximum", async () => {
    databaseMocks.total = 2;

    await expect(
      enforceParticipationRateLimits([
        { keyType: "USER", maximum: 3, value: "user-value", windowMs: 60_000 },
      ]),
    ).resolves.toBeUndefined();

    expect(databaseMocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        blocked: false,
        keyType: "USER",
        reason: null,
      }),
    );
  });
});
