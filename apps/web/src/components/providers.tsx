"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { defineChain } from "viem";

import { clientEnvironment } from "../env/env.client";

const giwaTestnet = defineChain({
  id: clientEnvironment.NEXT_PUBLIC_GIWA_CHAIN_ID,
  name: "GIWA Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [clientEnvironment.NEXT_PUBLIC_GIWA_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: "GIWA Sepolia Explorer",
      url: clientEnvironment.NEXT_PUBLIC_GIWA_EXPLORER_URL,
    },
  },
  testnet: true,
});

export function Providers({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <PrivyProvider
      appId={clientEnvironment.NEXT_PUBLIC_PRIVY_APP_ID}
      config={{
        appearance: {
          accentColor: "#006c49",
          logo: "/images/participation-badge.svg",
          showWalletLoginFirst: false,
        },
        defaultChain: giwaTestnet,
        embeddedWallets: {
          ethereum: { createOnLogin: "users-without-wallets" },
        },
        loginMethods: ["google"],
        supportedChains: [giwaTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
