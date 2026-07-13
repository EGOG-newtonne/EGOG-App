import { describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const serviceMocks = vi.hoisted(() => ({
  submitParticipationSignature: vi.fn(),
}));

vi.mock("../../../../server/participations/service", () => ({
  submitParticipationSignature: serviceMocks.submitParticipationSignature,
}));

function request() {
  return new Request("https://egog.example/api/participations/submit", {
    body: JSON.stringify({
      requestId: "00000000-0000-4000-8000-000000000001",
      signature: `0x${"1".repeat(130)}`,
    }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
}

describe("participation submission API rate limits", () => {
  it.each(["USER_RATE_LIMIT", "WALLET_RATE_LIMIT", "IP_RATE_LIMIT"])(
    "returns 429 for %s",
    async (code) => {
      serviceMocks.submitParticipationSignature.mockRejectedValueOnce(
        new Error(code),
      );

      const response = await POST(request());

      expect(response.status).toBe(429);
      await expect(response.json()).resolves.toEqual({ error: code });
    },
  );
});
