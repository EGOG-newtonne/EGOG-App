import { describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const serviceMocks = vi.hoisted(() => ({
  createParticipationChallenge: vi.fn(),
}));

vi.mock("../../../../server/participations/service", () => ({
  createParticipationChallenge: serviceMocks.createParticipationChallenge,
}));

function request() {
  return new Request("https://egog.example/api/participations/challenge", {
    body: JSON.stringify({
      emailOptIn: false,
      idempotencyKey: "00000000-0000-4000-8000-000000000001",
      projectSlug: "vietnam-brick",
      requiredConsent: true,
      walletAddress: `0x${"1".repeat(40)}`,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("participation challenge API rate limits", () => {
  it.each([
    "USER_RATE_LIMIT",
    "WALLET_RATE_LIMIT",
    "IP_RATE_LIMIT",
    "GLOBAL_RATE_LIMIT",
  ])("returns 429 for %s", async (code) => {
    serviceMocks.createParticipationChallenge.mockRejectedValueOnce(
      new Error(code),
    );

    const response = await POST(request());

    expect(response.status).toBe(429);
    await expect(response.json()).resolves.toEqual({ error: code });
  });
});
