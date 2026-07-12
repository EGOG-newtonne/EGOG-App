import { z } from "zod";

import { parseEnvironment } from "./env.parse";

const environmentNameSchema = z.enum(["development", "demo"]);
const giwaChainIdSchema = z.coerce
  .number()
  .int()
  .refine((value) => value === 91342, "must be the GIWA Testnet chain ID");
const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "must be a 20-byte EVM address");
const httpUrlSchema = z.url().refine(
  (value) => {
    const protocol = URL.parse(value)?.protocol;
    return protocol === "http:" || protocol === "https:";
  },
  "must use http or https",
);

export const clientEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_ENV: environmentNameSchema,
  NEXT_PUBLIC_PRIVY_APP_ID: z.string().trim().min(1),
  NEXT_PUBLIC_PINATA_GATEWAY_URL: httpUrlSchema,
  NEXT_PUBLIC_GIWA_RPC_URL: httpUrlSchema,
  NEXT_PUBLIC_GIWA_EXPLORER_URL: httpUrlSchema,
  NEXT_PUBLIC_GIWA_CHAIN_ID: giwaChainIdSchema,
  NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS: ethereumAddressSchema,
});

export function parseClientEnvironment(
  input: Readonly<Record<string, string | undefined>>,
) {
  return parseEnvironment(clientEnvironmentSchema, input, "client");
}
