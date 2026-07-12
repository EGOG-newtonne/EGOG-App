import { describe, expect, it } from "vitest";

import {
  findPrivyEmbeddedWallet,
  requireWalletAddress,
  shortenAddress,
} from "./wallet";

describe("embedded wallet boundary", () => {
  it("selects only a Privy embedded wallet", () => {
    const result = findPrivyEmbeddedWallet([
      { address: "0xexternal", walletClientType: "metamask" },
      { address: "0xembedded", walletClientType: "privy" },
    ]);

    expect(result?.address).toBe("0xembedded");
  });

  it("rejects malformed EVM addresses", () => {
    expect(() => requireWalletAddress("0x1234")).toThrow(/valid embedded EVM/);
  });

  it("shortens a valid address for the participation flow", () => {
    expect(
      shortenAddress("0x1234567890123456789012345678901234567890"),
    ).toBe("0x1234…7890");
  });
});
