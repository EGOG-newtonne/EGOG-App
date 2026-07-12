import { z } from "zod";

import { parseEnvironment } from "./env.parse";

const giwaChainIdSchema = z.coerce
  .number()
  .int()
  .refine((value) => value === 91342, "must be the GIWA Testnet chain ID");
const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "must be a 20-byte EVM address");
const privateKeySchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "must be a 32-byte EVM private key");
const httpUrlSchema = z.url().refine(
  (value) => {
    const protocol = URL.parse(value)?.protocol;
    return protocol === "http:" || protocol === "https:";
  },
  "must use http or https",
);
const postgresUrlSchema = z.url().refine(
  (value) => {
    const protocol = URL.parse(value)?.protocol;
    return protocol === "postgres:" || protocol === "postgresql:";
  },
  "must use postgres or postgresql",
);
const transactionPoolerUrlSchema = postgresUrlSchema.refine(
  (value) => URL.parse(value)?.port === "6543",
  "must use the Supavisor transaction pooler port 6543",
);
const directDatabaseUrlSchema = postgresUrlSchema.refine(
  (value) => URL.parse(value)?.port === "5432",
  "must use the direct Postgres port 5432",
);

export const serverEnvironmentSchema = z.object({
  DATABASE_URL: transactionPoolerUrlSchema,
  DATABASE_DIRECT_URL: directDatabaseUrlSchema,
  PRIVY_APP_SECRET: z.string().trim().min(1),
  PINATA_JWT: z.string().regex(/^[^.]+\.[^.]+\.[^.]+$/, "must be a JWT"),
  AWS_S3_BUCKET: z
    .string()
    .regex(/^(?!xn--)(?!sthree-)[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/),
  AWS_REGION: z.string().regex(/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/),
  AWS_ACCESS_KEY_ID: z.string().trim().min(16),
  AWS_SECRET_ACCESS_KEY: z.string().trim().min(32),
  GIWA_RPC_URL: httpUrlSchema,
  GIWA_CHAIN_ID: giwaChainIdSchema,
  PARTICIPATION_CONTRACT_ADDRESS: ethereumAddressSchema,
  GIWA_RELAYER_PRIVATE_KEY: privateKeySchema,
  CRON_SECRET: z.string().min(32),
});

export function parseServerEnvironment(
  input: Readonly<Record<string, string | undefined>>,
) {
  return parseEnvironment(serverEnvironmentSchema, input, "server");
}
