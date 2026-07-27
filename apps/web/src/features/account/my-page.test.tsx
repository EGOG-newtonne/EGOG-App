import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MyPage } from "./my-page";

const privyMocks = vi.hoisted(() => ({
  getAccessToken: vi.fn().mockResolvedValue("privy-access-token"),
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock("@privy-io/react-auth", () => ({
  usePrivy: () => ({
    authenticated: true,
    getAccessToken: privyMocks.getAccessToken,
    login: privyMocks.login,
    logout: privyMocks.logout,
    ready: true,
  }),
  useWallets: () => ({
    wallets: [
      {
        address: "0x1234567890123456789012345678901234567890",
        walletClientType: "privy",
      },
    ],
  }),
}));

vi.mock("../../env/env.client", () => ({
  clientEnvironment: {
    NEXT_PUBLIC_GIWA_EXPLORER_URL: "https://explorer.test",
    NEXT_PUBLIC_PINATA_GATEWAY_URL: "https://gateway.test/ipfs",
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

describe("MyPage account deletion", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("uses the shared confirmation dialog instead of a native confirm", async () => {
    const fetchMock = vi.fn().mockImplementation((input: string) => {
      if (input === "/api/me/participations") {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      if (input === "/api/me/preferences") {
        return Promise.resolve({ ok: true, json: async () => ({ emailOptIn: false }) });
      }
      throw new Error(`Unexpected request: ${input}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();
    render(<MyPage />);

    await user.click(await screen.findByRole("button", { name: "Delete account" }));

    expect(screen.getByRole("alertdialog", { name: "Delete your EGOG account?" })).toBeTruthy();
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it("labels Jeju field evidence without inventing a tCO2e value", async () => {
    const fieldEvidence = {
      snapshotKind: "field_evidence",
      projectId: "jeju-erw-001",
      dataType: "actual",
      version: 1,
      monitoringPeriod: { start: "2026-07-07", end: "2026-07-27" },
      carbonDataStatus: "pending",
      verificationStage: "MONITORING",
      verificationSourceStatus: "Field evidence published.",
      measuredAt: "2026-07-27T01:20:02.000Z",
      publishedAt: "2026-07-27T01:30:00.000Z",
      sourceName: "Newtonne field evidence",
      sourceVersion: "jeju-erw-v1",
      verificationNote: "Does not verify carbon removal.",
      media: [],
    };
    vi.stubGlobal("fetch", vi.fn().mockImplementation((input: string) => {
      if (input === "/api/me/participations") {
        return Promise.resolve({
          ok: true,
          json: async () => [{
            project: {
              slug: "jeju-erw",
              name: "Jeju ERW Project",
              heroImage: "/images/jeju-erw/jeju-field-site.jpg",
            },
            participation: {
              memberNumber: "1",
              tokenId: "8",
              tokenUri: "ipfs://badge",
              transactionHash: "0x123",
              walletAddress: "0x1234567890123456789012345678901234567890",
              joinedAt: "2026-07-27T02:00:00.000Z",
            },
            joinedSnapshot: {
              version: 1,
              dataType: "actual",
              gatewayUrl: "https://gateway.test/ipfs/snapshot",
              publicData: fieldEvidence,
            },
            latestSnapshot: {
              version: 1,
              verificationStage: "MONITORING",
              publicData: fieldEvidence,
            },
          }],
        });
      }
      if (input === "/api/me/preferences") {
        return Promise.resolve({ ok: true, json: async () => ({ emailOptIn: false }) });
      }
      throw new Error(`Unexpected request: ${input}`);
    }));

    render(<MyPage />);

    expect(await screen.findByText("Field evidence at join")).toBeTruthy();
    expect(screen.getAllByText("Field Evidence Snapshot v1 · Carbon data pending")).toHaveLength(2);
    expect(screen.queryByText(/— tCO₂e/)).toBeNull();
  });
});
