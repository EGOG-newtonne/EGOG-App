import { createHash } from "node:crypto";
import { resolve } from "node:path";

import { participationBadgeAbi } from "../packages/contract-types/src/index.js";
import {
  hashSnapshot,
  isFieldEvidenceSnapshot,
  publicSnapshotSchema,
  snapshotKind,
} from "../packages/shared/src/index.js";
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
  const jeju = projectRows.find((project) => project.slug === "jeju-erw");
  if (!jeju || jeju.status !== "active" || !jeju.currentSnapshotId) {
    throw new Error("Jeju ERW is not active/current");
  }
  const solar = projectRows.find((project) => project.slug === "solar-mobility");
  if (!solar || solar.status !== "coming_soon") throw new Error("Solar Mobility state is invalid");
  const vietnamSnapshots = snapshotRows.filter((snapshot) => snapshot.projectId === vietnam.id);
  if (vietnamSnapshots.length !== 3) throw new Error(`Expected 3 Vietnam snapshots, found ${vietnamSnapshots.length}`);
  const current = vietnamSnapshots.find((snapshot) => snapshot.id === vietnam.currentSnapshotId);
  if (!current || current.version !== 3) throw new Error("Vietnam current Snapshot is not v3");
  const jejuSnapshots = snapshotRows.filter((snapshot) => snapshot.projectId === jeju.id);
  if (jejuSnapshots.length !== 1) {
    throw new Error(`Expected 1 Jeju evidence Snapshot, found ${jejuSnapshots.length}`);
  }
  const jejuCurrent = jejuSnapshots.find((snapshot) => snapshot.id === jeju.currentSnapshotId);
  if (!jejuCurrent || jejuCurrent.version !== 1) {
    throw new Error("Jeju current Snapshot is not field evidence v1");
  }

  for (const row of snapshotRows) {
    const publicData = publicSnapshotSchema.parse(row.publicData);
    if (
      snapshotKind(publicData) === "climate_metrics" &&
      publicData.dataType !== "demonstration"
    ) {
      throw new Error(`Climate Snapshot is not demonstrational: ${row.id}`);
    }
    if (hashSnapshot(publicData) !== row.snapshotHash) throw new Error(`DB Snapshot hash mismatch: ${row.id}`);
    const response = await fetch(gatewayUrl(row.snapshotUri, gateway), { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`IPFS Snapshot unavailable: ${row.snapshotUri}`);
    const published = publicSnapshotSchema.parse(await response.json());
    if (hashSnapshot(published) !== row.snapshotHash) throw new Error(`IPFS Snapshot hash mismatch: ${row.id}`);
    if (isFieldEvidenceSnapshot(published)) {
      for (const media of published.media) {
        const mediaResponse = await fetch(media.gatewayUrl, {
          signal: AbortSignal.timeout(15_000),
        });
        if (!mediaResponse.ok) throw new Error(`IPFS evidence unavailable: ${media.ipfsUri}`);
        const digest = createHash("sha256")
          .update(Buffer.from(await mediaResponse.arrayBuffer()))
          .digest("hex");
        if (digest !== media.sha256) {
          throw new Error(`IPFS evidence hash mismatch: ${media.id}`);
        }
      }
    }
  }

  const bytecode = await client.getCode({ address: contractAddress });
  if (!bytecode || bytecode === "0x") throw new Error("Demo contract bytecode not found");
  const counts: Record<string, string> = {};
  for (const project of [vietnam, jeju]) {
    const projectId = keccak256(stringToBytes(project.slug));
    const [active, memberCount] = await Promise.all([
      client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "projectActive", args: [projectId] }),
      client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "projectMemberCount", args: [projectId] }),
    ]);
    if (!active) throw new Error(`${project.name} is inactive on the Demo contract`);
    const projectParticipations = participationRows.filter(
      (participation) => participation.projectId === project.id,
    );
    if (
      Number(memberCount) !== project.cachedMemberCount ||
      Number(memberCount) !== projectParticipations.length
    ) {
      throw new Error(
        `${project.name} member count mismatch chain=${memberCount} cache=${project.cachedMemberCount} rows=${projectParticipations.length}`,
      );
    }
    counts[project.slug] = memberCount.toString();

    for (const participation of projectParticipations) {
      const [joined, tokenUri] = await Promise.all([
        client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "hasParticipated", args: [projectId, getAddress(participation.walletAddress)] }),
        client.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "tokenURI", args: [participation.tokenId] }),
      ]);
      if (!joined) throw new Error(`Missing on-chain participation for ${participation.id}`);
      if (tokenUri !== participation.tokenUri) throw new Error(`Token URI mismatch for ${participation.id}`);
      const metadataResponse = await fetch(gatewayUrl(tokenUri, gateway), { signal: AbortSignal.timeout(15_000) });
      if (!metadataResponse.ok) throw new Error(`Badge metadata unavailable: ${tokenUri}`);
    }
  }

  console.log(JSON.stringify({
    environment: "demo",
    projects: projectRows.length,
    snapshots: snapshotRows.length,
    vietnamCurrentSnapshotVersion: current.version,
    jejuCurrentSnapshotVersion: jejuCurrent.version,
    contract: contractAddress as Address,
    memberCounts: counts,
    result: "PASS",
  }));
  await database.sql.end();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Demo verification failed");
  process.exitCode = 1;
});
