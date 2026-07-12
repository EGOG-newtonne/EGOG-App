import type { Address } from "viem";

export type WalletCandidate = {
  address: string;
  walletClientType: string;
};

export function findPrivyEmbeddedWallet(
  wallets: readonly WalletCandidate[],
): WalletCandidate | undefined {
  return wallets.find(
    (wallet) =>
      wallet.walletClientType === "privy" || wallet.walletClientType === "privy_v2",
  );
}

export function requireWalletAddress(address: string): Address {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Privy did not return a valid embedded EVM wallet address.");
  }
  return address as Address;
}

export function shortenAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
