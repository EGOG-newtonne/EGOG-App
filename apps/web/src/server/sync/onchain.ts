import "server-only";

import { participationBadgeAbi } from "@egog/contract-types";
import { and, eq } from "drizzle-orm";
import { getAddress, keccak256, stringToBytes, type Address, type Hex } from "viem";

import { serverEnvironment } from "../../env/env.server";
import { publicClient } from "../chain/clients";
import { db } from "../db/client";
import {
  onchainEvents,
  participationRequests,
  participations,
  projects,
  syncState,
} from "../db/schema";

const stateKey = `participation:${serverEnvironment.PARTICIPATION_CONTRACT_ADDRESS}`;

export async function syncOnchainParticipations() {
  const latestBlock = await publicClient.getBlockNumber();
  const [state] = await db.select().from(syncState).where(eq(syncState.key, stateKey)).limit(1);
  const fromBlock = state ? state.lastSyncedBlock + 1n : latestBlock > 100_000n ? latestBlock - 100_000n : 0n;
  if (fromBlock > latestBlock) return { events: 0, lastSyncedBlock: latestBlock.toString() };

  const projectRows = await db.select().from(projects);
  const byHash = new Map(projectRows.map((project) => [keccak256(stringToBytes(project.slug)), project]));
  let processed = 0;
  const chunkSize = 5_000n;
  for (let start = fromBlock; start <= latestBlock; start += chunkSize) {
    const end = start + chunkSize - 1n > latestBlock ? latestBlock : start + chunkSize - 1n;
    const events = await publicClient.getContractEvents({
      address: serverEnvironment.PARTICIPATION_CONTRACT_ADDRESS as Address,
      abi: participationBadgeAbi,
      eventName: "ParticipationRecorded",
      fromBlock: start,
      toBlock: end,
    });
    for (const event of events) {
      if (event.logIndex == null || !event.transactionHash) continue;
      const args = event.args;
      const project = args.projectId ? byHash.get(args.projectId) : undefined;
      if (!project || !args.participant || args.tokenId == null || args.memberNumber == null || !args.snapshotHash || args.snapshotVersion == null || !args.snapshotURI || !args.tokenURI || args.joinedAt == null) continue;
      await db.insert(onchainEvents).values({
        transactionHash: event.transactionHash,
        logIndex: event.logIndex,
        blockNumber: event.blockNumber,
        eventName: "ParticipationRecorded",
        payload: {
          participant: args.participant,
          projectId: args.projectId,
          tokenId: args.tokenId.toString(),
          memberNumber: args.memberNumber.toString(),
          snapshotHash: args.snapshotHash,
          snapshotVersion: args.snapshotVersion.toString(),
          snapshotURI: args.snapshotURI,
          tokenURI: args.tokenURI,
          joinedAt: args.joinedAt.toString(),
        },
      }).onConflictDoNothing();

      const [requestByTransaction] = await db.select().from(participationRequests).where(eq(participationRequests.transactionHash, event.transactionHash)).limit(1);
      const [requestByIdentity] = requestByTransaction ? [] : await db
        .select()
        .from(participationRequests)
        .where(and(
          eq(participationRequests.projectId, project.id),
          eq(participationRequests.walletAddress, getAddress(args.participant)),
          eq(participationRequests.expectedMemberNumber, args.memberNumber),
        ))
        .limit(1);
      const request = requestByTransaction ?? requestByIdentity;
      if (request) {
        await db.insert(participations).values({
          requestId: request.id,
          userId: request.userId,
          walletAddress: getAddress(args.participant),
          projectId: project.id,
          snapshotId: request.snapshotId,
          snapshotHash: args.snapshotHash,
          snapshotVersion: Number(args.snapshotVersion),
          snapshotUri: args.snapshotURI,
          tokenId: args.tokenId,
          memberNumber: args.memberNumber,
          tokenUri: args.tokenURI,
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          logIndex: event.logIndex,
          joinedAt: new Date(Number(args.joinedAt) * 1000),
        }).onConflictDoNothing();
        await db.update(participationRequests).set({
          status: "CONFIRMED",
          transactionHash: event.transactionHash,
          lastErrorCode: null,
          updatedAt: new Date(),
        }).where(eq(participationRequests.id, request.id));
      }
      if (project.cachedMemberCount < Number(args.memberNumber)) {
        await db.update(projects).set({ cachedMemberCount: Number(args.memberNumber), updatedAt: new Date() }).where(eq(projects.id, project.id));
      }
      processed += 1;
    }
  }

  for (const project of projectRows) {
    const count = await publicClient.readContract({
      address: serverEnvironment.PARTICIPATION_CONTRACT_ADDRESS as Address,
      abi: participationBadgeAbi,
      functionName: "projectMemberCount",
      args: [keccak256(stringToBytes(project.slug))],
    });
    await db.update(projects).set({ cachedMemberCount: Number(count), updatedAt: new Date() }).where(eq(projects.id, project.id));
  }
  await db.insert(syncState).values({ key: stateKey, lastSyncedBlock: latestBlock }).onConflictDoUpdate({ target: syncState.key, set: { lastSyncedBlock: latestBlock, updatedAt: new Date() } });
  return { events: processed, lastSyncedBlock: latestBlock.toString() };
}

export async function reconcileSubmittedTransactions() {
  const rows = await db.select().from(participationRequests).where(eq(participationRequests.status, "TX_SUBMITTED"));
  let reconciled = 0;
  for (const request of rows) {
    if (!request.transactionHash) continue;
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: request.transactionHash as Hex });
      if (receipt.status === "reverted") {
        await db.update(participationRequests).set({ status: "FAILED_RETRYABLE", lastErrorCode: "TRANSACTION_REVERTED", retryCount: request.retryCount + 1, updatedAt: new Date() }).where(eq(participationRequests.id, request.id));
      }
      reconciled += 1;
    } catch {
      // A transaction that is not mined remains TX_SUBMITTED and is checked again.
    }
  }
  return { reconciled };
}
