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
});
