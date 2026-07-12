import "server-only";

import { giwaTestnet } from "@egog/shared";
import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { serverEnvironment } from "../../env/env.server";

const chain = {
  ...giwaTestnet,
  rpcUrls: { default: { http: [serverEnvironment.GIWA_RPC_URL] } },
};

export const publicClient = createPublicClient({
  chain,
  transport: http(serverEnvironment.GIWA_RPC_URL),
});

export const relayerAccount = privateKeyToAccount(
  serverEnvironment.GIWA_RELAYER_PRIVATE_KEY as Hex,
);

export const relayerClient = createWalletClient({
  account: relayerAccount,
  chain,
  transport: http(serverEnvironment.GIWA_RPC_URL),
});
