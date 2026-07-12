import { resolve } from "node:path";

import { participationBadgeAbi } from "../packages/contract-types/src/index.js";
import { hashSnapshot, publicSnapshotSchema } from "../packages/shared/src/index.js";
import { createPublicClient, defineChain, getAddress, http, keccak256, stringToBytes, type Address } from "viem";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function gatewayUrl(uri: string, gatewayBase: string) {
  if (!uri.startsWith("ipfs://")) throw new Error(`Expected IPFS URI: ${uri}`);
  return `${gatewayBase.replace(/\/$/, "")}/${uri.slice("ipfs://".length)}`;
}

async function main() {
  const envFile = process.argv.find((value) => value.startsWith("--env-file="))?.split("=")[1];
  if (envFile) process.loadEnvFile(resolve(envFile));
  if (required("NEXT_PUBLIC_APP_ENV") !== "demo") throw new Error("Refusing to verify a non-demo environment");

  const [{ createDatabase }, schema] = await Promise.all([
    import("../apps/web/src/server/db/factory.js"),
    import("../apps/web/src/server/db/schema.js"),
  ]);
  const database = createDatabase(required("DATABASE_URL"));
  const contractAddress = getAddress(required("PARTICIPATION_CONTRACT_ADDRESS"));
  if (contractAddress !== getAddress(required("NEXT_PUBLIC_PARTICIPATION_CONTRACT_ADDRESS"))) {
    throw new Error("Public/server contract address mismatch");
  }
  const chain = defineChain({
    id: Number(required("GIWA_CHAIN_ID")),
    name: "GIWA Sepolia",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: { default: { http: [required("GIWA_RPC_URL")] } },
  });
  const client = createPublicClient({ chain, transport: http(required("GIWA_RPC_URL")) });
  const gateway = required("NEXT_PUBLIC_PINATA_GATEWAY_URL");

  const [projectRows, snapshotRows, participationRows] = await Promise.all([
    database.db.select().from(schema.projects),
    database.db.select().from(schema.projectSnapshots),
    database.db.select().from(schema.participations),
  ]);
  if (projectRows.length !== 3) throw new Error(`Expected 3 projects, found ${projectRows.length}`);
  const vietnam = projectRows.find((project) => project.slug === "vietnam-brick");
  if (!vietnam || vietnam.status !== "active" || !vietnam.currentSnapshotId) throw new Error("Vietnam Brick is not active/current");
  const vietnamSnapshots = snapshotRows.filter((snapshot) => snapshot.projectId === vietnam.id);
  if (vietnamSnapshots.length !== 3) throw new Error(`Expected 3 Vietnam snapshots, found ${vietnamSnapshots.length}`);
  const current = vietnamSnapshots.find((snapshot) => snapshot.id === vietnam.currentSnapshotId);
  if (!current || current.version !== 3) throw new Error("Vietnam current Snapshot is not v3");

  for (const row of snapshotRows) {
    const publicData = publicSnapshotSchema.parse(row.publicData);
    if (publicData.dataType !== "demonstration") throw new Error(`Non-demonstration Snapshot found: ${row.id}`);
    if (hashSnapshot(publicData) !== row.snapshotHash) throw new Error(`DB Snapshot hash mismatch: ${row.id}`);
    const response = await fetch(gatewayUrl(row.snapshotUri, gateway), { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`IPFS Snapshot unavailable: ${row.snapshotUri}`);
    const published = publicSnapshotSchema.parse(await response.json());
    if (hashSnapshot(published) !== row.snapshotHash) throw new Error(`IPFS Snapshot hash mismatch: ${row.id}`);
  }

  const bytecode = await client.getCode({ address: contractAddress });
  if (!bytecode || bytecode === "0x") throw new Error("Demo contract bytecode not found");
  const projectId = keccak256(stringToBytes(vietnam.slug));
  const [active, memberCount] = await Promise.all([
    client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "projectActive", args: [projectId] }),
    client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "projectMemberCount", args: [projectId] }),
  ]);
  if (!active) throw new Error("Vietnam Brick is inactive on the Demo contract");
  if (Number(memberCount) !== vietnam.cachedMemberCount || Number(memberCount) !== participationRows.length) {
    throw new Error(`Member count mismatch chain=${memberCount} cache=${vietnam.cachedMemberCount} rows=${participationRows.length}`);
  }

  for (const participation of participationRows) {
    const [joined, tokenUri] = await Promise.all([
      client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "hasParticipated", args: [projectId, getAddress(participation.walletAddress)] }),
      client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "tokenURI", args: [participation.tokenId] }),
    ]);
    if (!joined) throw new Error(`Missing on-chain participation for ${participation.id}`);
    if (tokenUri !== participation.tokenUri) throw new Error(`Token URI mismatch for ${participation.id}`);
    const metadataResponse = await fetch(gatewayUrl(tokenUri, gateway), { signal: AbortSignal.timeout(15_000) });
    if (!metadataResponse.ok) throw new Error(`Badge metadata unavailable: ${tokenUri}`);
  }

  console.log(JSON.stringify({
    environment: "demo",
    projects: projectRows.length,
    snapshots: snapshotRows.length,
    currentSnapshotVersion: current.version,
    contract: contractAddress as Address,
    memberCount: memberCount.toString(),
    result: "PASS",
  }));
  await database.sql.end();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Demo verification failed");
  process.exitCode = 1;
});
