import "server-only";

import { randomBytes } from "node:crypto";

import { participationBadgeAbi } from "@egog/contract-types";
import {
  buildParticipationTypedData,
  publicSnapshotSchema,
} from "@egog/shared";
import { and, eq, inArray, sql } from "drizzle-orm";
import {
  decodeEventLog,
  getAddress,
  keccak256,
  recoverTypedDataAddress,
  stringToBytes,
  type Address,
  type Hex,
  type TransactionReceipt,
} from "viem";

import { clientEnvironment } from "../../env/env.client";
import { serverEnvironment } from "../../env/env.server";
import {
  authenticatePrivyRequest,
  upsertAuthenticatedUser,
} from "../auth/privy";
import { publicClient, relayerClient } from "../chain/clients";
import { db } from "../db/client";
import {
  participationRequests,
  participations,
  projects,
  projectSnapshots,
  users,
} from "../db/schema";
import { enforceParticipationRateLimits } from "../rate-limit/limiter";
import { createPinataUploader } from "../storage/pinata";
import { publishPublicAsset } from "../storage/public-assets";
import { createS3BackupWriter } from "../storage/s3";
import { createBadgeMetadata, encodeJsonAsset } from "./metadata";
import { projectAdvisoryLockId } from "./project-lock";
import { decideParticipationRecovery } from "./retry-participation";

const contractAddress = serverEnvironment.PARTICIPATION_CONTRACT_ADDRESS as Address;
const uploadPublic = createPinataUploader(serverEnvironment.PINATA_JWT);
const putBackup = createS3BackupWriter({
  bucket: serverEnvironment.AWS_S3_BUCKET,
  region: serverEnvironment.AWS_REGION,
  accessKeyId: serverEnvironment.AWS_ACCESS_KEY_ID,
  secretAccessKey: serverEnvironment.AWS_SECRET_ACCESS_KEY,
});

export function projectIdForContract(slug: string) {
  return keccak256(stringToBytes(slug));
}

function nonce() {
  return BigInt(`0x${randomBytes(16).toString("hex")}`);
}

function participationMessage(request: typeof participationRequests.$inferSelect, slug: string) {
  if (!request.expectedMemberNumber || !request.tokenUri) {
    throw new Error("PARTICIPATION_NOT_SIGNABLE");
  }
  return {
    participant: getAddress(request.walletAddress),
    projectId: projectIdForContract(slug),
    snapshotHash: request.snapshotHash as Hex,
    snapshotVersion: BigInt(request.snapshotVersion),
    snapshotURI: request.snapshotUri,
    memberNumber: request.expectedMemberNumber,
    tokenURI: request.tokenUri,
    nonce: request.nonce,
    deadline: BigInt(Math.floor(request.deadline.getTime() / 1000)),
  } as const;
}

function serializeChallenge(request: typeof participationRequests.$inferSelect, slug: string) {
  const message = participationMessage(request, slug);
  return {
    action: "SIGN" as const,
    requestId: request.id,
    status: request.status,
    message: {
      ...message,
      snapshotVersion: message.snapshotVersion.toString(),
      memberNumber: message.memberNumber.toString(),
      nonce: message.nonce.toString(),
      deadline: message.deadline.toString(),
    },
    typedData: {
      ...buildParticipationTypedData(contractAddress, message),
      message: {
        ...message,
        snapshotVersion: message.snapshotVersion.toString(),
        memberNumber: message.memberNumber.toString(),
        nonce: message.nonce.toString(),
        deadline: message.deadline.toString(),
      },
    },
  };
}

async function confirmedResult(request: typeof participationRequests.$inferSelect) {
  const [participation] = await db
    .select()
    .from(participations)
    .where(eq(participations.requestId, request.id))
    .limit(1);
  if (!participation || !request.transactionHash) {
    return {
      action: "PROCESSING" as const,
      requestId: request.id,
      status: request.status,
      transactionHash: request.transactionHash,
    };
  }
  return {
    action: "CONFIRMED" as const,
    requestId: request.id,
    status: "CONFIRMED" as const,
    transactionHash: request.transactionHash,
    tokenId: participation.tokenId.toString(),
    memberNumber: participation.memberNumber.toString(),
    tokenUri: participation.tokenUri,
    walletAddress: participation.walletAddress,
    joinedAt: participation.joinedAt.toISOString(),
  };
}

function processingResult(request: typeof participationRequests.$inferSelect) {
  return {
    action: "PROCESSING" as const,
    requestId: request.id,
    status: request.status,
    transactionHash: request.transactionHash,
  };
}

async function publishMetadataForRequest(
  request: typeof participationRequests.$inferSelect,
  project: typeof projects.$inferSelect,
  snapshotRow: typeof projectSnapshots.$inferSelect,
) {
  if (!request.expectedMemberNumber || !project.badgeImageUri) {
    throw new Error("PARTICIPATION_METADATA_INPUT_MISSING");
  }
  const snapshot = publicSnapshotSchema.parse(snapshotRow.publicData);
  const metadata = createBadgeMetadata({
    projectName: project.name,
    memberNumber: request.expectedMemberNumber,
    joinedAt: request.requiredConsentAt ?? request.createdAt,
    snapshot,
    snapshotUri: snapshotRow.snapshotUri,
    badgeImageUri: project.badgeImageUri,
  });
  const published = await publishPublicAsset(
    encodeJsonAsset(
      metadata,
      `${project.slug}-participant-${request.expectedMemberNumber}.json`,
      `badges/${project.slug}/${request.expectedMemberNumber}.json`,
    ),
    { uploadPublic, putBackup, gatewayBaseUrl: clientEnvironment.NEXT_PUBLIC_PINATA_GATEWAY_URL },
  );
  const [updated] = await db
    .update(participationRequests)
    .set({
      tokenUri: published.ipfsUri,
      metadataCid: published.cid,
      status: "METADATA_UPLOADED",
      lastErrorCode: null,
      updatedAt: new Date(),
    })
    .where(eq(participationRequests.id, request.id))
    .returning();
  if (!updated) throw new Error("PARTICIPATION_UPDATE_FAILED");
  return updated;
}

async function refreshUnsignedParticipationRequest(
  request: typeof participationRequests.$inferSelect,
  project: typeof projects.$inferSelect,
) {
  if (!project.currentSnapshotId) throw new Error("CURRENT_SNAPSHOT_NOT_FOUND");
  const [snapshotRow] = await db
    .select()
    .from(projectSnapshots)
    .where(eq(projectSnapshots.id, project.currentSnapshotId))
    .limit(1);
  if (!snapshotRow) throw new Error("CURRENT_SNAPSHOT_NOT_FOUND");
  const onchainProjectId = projectIdForContract(project.slug);
  const now = new Date();
  const refreshed = await db.transaction(async (transaction) => {
    await transaction.execute(sql`select pg_advisory_xact_lock(${projectAdvisoryLockId(project.id)})`);
    const currentMemberCount = await publicClient.readContract({
      address: contractAddress,
      abi: participationBadgeAbi,
      functionName: "projectMemberCount",
      args: [onchainProjectId],
    });
    const [updated] = await transaction.update(participationRequests).set({
      snapshotId: snapshotRow.id,
      snapshotHash: snapshotRow.snapshotHash,
      snapshotVersion: snapshotRow.version,
      snapshotUri: snapshotRow.snapshotUri,
      nonce: nonce(),
      deadline: new Date(now.getTime() + 10 * 60_000),
      status: "CONSENTED",
      expectedMemberNumber: currentMemberCount + 1n,
      tokenUri: null,
      metadataCid: null,
      signature: null,
      transactionHash: null,
      lastErrorCode: null,
      retryCount: 0,
      updatedAt: now,
    }).where(eq(participationRequests.id, request.id)).returning();
    if (!updated) throw new Error("PARTICIPATION_REFRESH_FAILED");
    return updated;
  });
  return { refreshed, snapshotRow };
}

async function finalizeParticipationReceipt(
  request: typeof participationRequests.$inferSelect,
  project: typeof projects.$inferSelect,
  transactionHash: Hex,
  receipt: TransactionReceipt,
) {
  if (receipt.status !== "success") throw new Error("TRANSACTION_REVERTED");
  const log = receipt.logs.map((item) => {
    try { return { item, decoded: decodeEventLog({ abi: participationBadgeAbi, data: item.data, topics: item.topics }) }; }
    catch { return null; }
  }).find((item) => item?.decoded.eventName === "ParticipationRecorded");
  if (!log || log.decoded.eventName !== "ParticipationRecorded") throw new Error("PARTICIPATION_EVENT_MISSING");
  const args = log.decoded.args;
  const joinedAt = new Date(Number(args.joinedAt) * 1000);

  await db.transaction(async (transaction) => {
    await transaction.insert(participations).values({
      requestId: request.id,
      userId: request.userId,
      walletAddress: request.walletAddress,
      projectId: request.projectId,
      snapshotId: request.snapshotId,
      snapshotHash: request.snapshotHash,
      snapshotVersion: request.snapshotVersion,
      snapshotUri: request.snapshotUri,
      tokenId: args.tokenId,
      memberNumber: args.memberNumber,
      tokenUri: args.tokenURI,
      transactionHash,
      blockNumber: receipt.blockNumber,
      logIndex: log.item.logIndex,
      joinedAt,
    }).onConflictDoNothing();
    await transaction.update(participationRequests).set({ status: "CONFIRMED", transactionHash, lastErrorCode: null, updatedAt: new Date() }).where(eq(participationRequests.id, request.id));
    await transaction.update(projects).set({ cachedMemberCount: Number(args.memberNumber), updatedAt: new Date() }).where(eq(projects.id, project.id));
  });
  return {
    action: "CONFIRMED" as const,
    status: "CONFIRMED" as const,
    transactionHash,
    tokenId: args.tokenId.toString(),
    memberNumber: args.memberNumber.toString(),
    tokenUri: args.tokenURI,
    walletAddress: request.walletAddress,
    joinedAt: joinedAt.toISOString(),
  };
}

export async function createParticipationChallenge(
  httpRequest: Request,
  input: {
    projectSlug: string;
    walletAddress: string;
    idempotencyKey: string;
    requiredConsent: boolean;
    emailOptIn: boolean;
  },
) {
  if (!input.requiredConsent) throw new Error("REQUIRED_CONSENT_MISSING");
  const auth = await authenticatePrivyRequest(httpRequest, input.walletAddress);
  const user = await upsertAuthenticatedUser(auth);
  const ip = httpRequest.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  await enforceParticipationRateLimits([
    { keyType: "USER", value: auth.privyUserId, maximum: 3, windowMs: 60_000 },
    { keyType: "WALLET", value: auth.walletAddress.toLowerCase(), maximum: 3, windowMs: 60_000 },
    { keyType: "IP", value: ip, maximum: 20, windowMs: 3_600_000 },
    { keyType: "GLOBAL", value: "global", maximum: 200, windowMs: 86_400_000 },
  ]);

  const [project] = await db.select().from(projects).where(eq(projects.slug, input.projectSlug)).limit(1);
  if (!project || project.status !== "active" || !project.currentSnapshotId || !project.badgeImageUri) {
    throw new Error("PROJECT_NOT_PARTICIPATABLE");
  }

  const [existing] = await db
    .select()
    .from(participationRequests)
    .where(eq(participationRequests.idempotencyKey, input.idempotencyKey))
    .limit(1);
  if (existing) {
    if (existing.walletAddress.toLowerCase() !== auth.walletAddress.toLowerCase()) {
      throw new Error("IDEMPOTENCY_OWNERSHIP_MISMATCH");
    }
    if (existing.projectId !== project.id) throw new Error("IDEMPOTENCY_PROJECT_MISMATCH");
    const action = decideParticipationRecovery(existing);
    if (action === "COMPLETE") return confirmedResult(existing);
    if (action === "POLL_TRANSACTION" || action === "RETRY_TRANSACTION") return processingResult(existing);
    if (action === "FAIL_FINAL") {
      await db.update(participationRequests).set({ expectedMemberNumber: null, updatedAt: new Date() }).where(eq(participationRequests.id, existing.id));
      throw new Error("PARTICIPATION_FAILED_FINAL");
    }
    if (action === "EXPIRE_UNSIGNED") {
      await db.update(participationRequests).set({
        status: "EXPIRED",
        expectedMemberNumber: null,
        lastErrorCode: "SIGNATURE_EXPIRED",
        updatedAt: new Date(),
      }).where(eq(participationRequests.id, existing.id));
      throw new Error("SIGNATURE_EXPIRED");
    }
    if (action === "REFRESH_CHALLENGE") {
      try {
        const { refreshed, snapshotRow } = await refreshUnsignedParticipationRequest(existing, project);
        const updated = await publishMetadataForRequest(refreshed, project, snapshotRow);
        return serializeChallenge(updated, project.slug);
      } catch (error) {
        if (error instanceof Error && error.message.includes("participation_requests_project_member_unique")) {
          throw new Error("PROJECT_MINT_QUEUE_BUSY", { cause: error });
        }
        throw error;
      }
    }
    if (action === "RETRY_METADATA") {
      const [snapshotRow] = await db.select().from(projectSnapshots).where(eq(projectSnapshots.id, existing.snapshotId)).limit(1);
      if (!snapshotRow) throw new Error("SNAPSHOT_NOT_FOUND");
      try {
        const updated = await publishMetadataForRequest(existing, project, snapshotRow);
        return serializeChallenge(updated, project.slug);
      } catch (error) {
        await db.update(participationRequests).set({
          status: "FAILED_RETRYABLE",
          retryCount: existing.retryCount + 1,
          lastErrorCode: "METADATA_PUBLICATION_FAILED",
          updatedAt: new Date(),
        }).where(eq(participationRequests.id, existing.id));
        throw error;
      }
    }
    return serializeChallenge(existing, project.slug);
  }

  const [alreadyJoined] = await db
    .select({ id: participations.id })
    .from(participations)
    .where(
      and(
        eq(participations.walletAddress, auth.walletAddress),
        eq(participations.projectId, project.id),
      ),
    )
    .limit(1);
  if (alreadyJoined) throw new Error("ALREADY_PARTICIPATED");

  const [snapshotRow] = await db
    .select()
    .from(projectSnapshots)
    .where(eq(projectSnapshots.id, project.currentSnapshotId))
    .limit(1);
  if (!snapshotRow) throw new Error("CURRENT_SNAPSHOT_NOT_FOUND");
  const onchainProjectId = projectIdForContract(project.slug);
  const [active, joined] = await Promise.all([
    publicClient.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "projectActive", args: [onchainProjectId] }),
    publicClient.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "hasParticipated", args: [onchainProjectId, auth.walletAddress] }),
  ]);
  if (!active) throw new Error("PROJECT_INACTIVE_ONCHAIN");
  if (joined) throw new Error("ALREADY_PARTICIPATED");

  const now = new Date();
  const deadline = new Date(now.getTime() + 10 * 60_000);
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60_000);
  let reserved: typeof participationRequests.$inferSelect;
  try {
    reserved = await db.transaction(async (transaction) => {
      await transaction.execute(sql`select pg_advisory_xact_lock(${projectAdvisoryLockId(project.id)})`);
      const currentMemberCount = await publicClient.readContract({
        address: contractAddress,
        abi: participationBadgeAbi,
        functionName: "projectMemberCount",
        args: [onchainProjectId],
      });
      const [inserted] = await transaction
        .insert(participationRequests)
        .values({
          idempotencyKey: input.idempotencyKey,
          userId: user.id,
          walletAddress: auth.walletAddress,
          projectId: project.id,
          snapshotId: snapshotRow.id,
          snapshotHash: snapshotRow.snapshotHash,
          snapshotVersion: snapshotRow.version,
          snapshotUri: snapshotRow.snapshotUri,
          nonce: nonce(),
          deadline,
          expiresAt,
          status: "CONSENTED",
          requiredConsentAt: now,
          emailOptIn: input.emailOptIn,
          emailOptInAt: input.emailOptIn ? now : null,
          expectedMemberNumber: currentMemberCount + 1n,
        })
        .returning();
      if (!inserted) throw new Error("PARTICIPATION_RESERVATION_FAILED");
      return inserted;
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("participation_requests_project_member_unique")) {
      throw new Error("PROJECT_MINT_QUEUE_BUSY", { cause: error });
    }
    throw error;
  }

  await db.update(users).set({
    emailOptIn: input.emailOptIn,
    emailOptInAt: input.emailOptIn ? now : null,
    updatedAt: now,
  }).where(eq(users.id, user.id));

  try {
    const updated = await publishMetadataForRequest(reserved, project, snapshotRow);
    return serializeChallenge(updated, project.slug);
  } catch (error) {
    await db.update(participationRequests).set({
      status: "FAILED_RETRYABLE",
      retryCount: reserved.retryCount + 1,
      lastErrorCode: "METADATA_PUBLICATION_FAILED",
      updatedAt: new Date(),
    }).where(eq(participationRequests.id, reserved.id));
    throw error;
  }
}

export async function submitParticipationSignature(
  httpRequest: Request,
  input: { requestId: string; signature: Hex },
) {
  const auth = await authenticatePrivyRequest(httpRequest);
  const ip = httpRequest.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  await enforceParticipationRateLimits([
    { keyType: "USER", value: auth.privyUserId, maximum: 5, windowMs: 60_000 },
    { keyType: "WALLET", value: auth.walletAddress.toLowerCase(), maximum: 5, windowMs: 60_000 },
    { keyType: "IP", value: ip, maximum: 20, windowMs: 3_600_000 },
  ], "participation_submit");
  const [request] = await db.select().from(participationRequests).where(eq(participationRequests.id, input.requestId)).limit(1);
  if (!request || request.walletAddress.toLowerCase() !== auth.walletAddress.toLowerCase()) {
    throw new Error("PARTICIPATION_REQUEST_NOT_FOUND");
  }
  if (request.status === "CONFIRMED") return confirmedResult(request);
  if (["SIGNED", "TX_SUBMITTED", "PROCESSING", "FAILED_RETRYABLE"].includes(request.status) && request.signature) {
    return processingResult(request);
  }
  if (!request.expectedMemberNumber || !request.tokenUri) throw new Error("PARTICIPATION_NOT_SIGNABLE");
  if (request.deadline.getTime() < Date.now()) throw new Error("SIGNATURE_EXPIRED");
  const [project] = await db.select().from(projects).where(eq(projects.id, request.projectId)).limit(1);
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  const message = participationMessage(request, project.slug);
  const signer = await recoverTypedDataAddress({
    ...buildParticipationTypedData(contractAddress, message),
    signature: input.signature,
  });
  if (signer.toLowerCase() !== auth.walletAddress.toLowerCase()) throw new Error("INVALID_PARTICIPATION_SIGNATURE");

  await db.update(participationRequests).set({ status: "SIGNED", signature: input.signature, updatedAt: new Date() }).where(eq(participationRequests.id, request.id));
  let transactionHash: Hex;
  try {
    transactionHash = await relayerClient.writeContract({
      address: contractAddress,
      abi: participationBadgeAbi,
      functionName: "joinBySig",
      args: [message.participant, message.projectId, message.snapshotHash, message.snapshotVersion, message.snapshotURI, message.memberNumber, message.tokenURI, message.nonce, message.deadline, input.signature],
    });
  } catch (error) {
    await db.update(participationRequests).set({
      status: "FAILED_RETRYABLE",
      lastErrorCode: "RELAYER_SUBMISSION_FAILED",
      retryCount: request.retryCount + 1,
      updatedAt: new Date(),
    }).where(eq(participationRequests.id, request.id));
    throw error;
  }
  await db.update(participationRequests).set({ status: "TX_SUBMITTED", transactionHash, updatedAt: new Date() }).where(eq(participationRequests.id, request.id));
  try {
    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash, confirmations: 1 });
    return await finalizeParticipationReceipt(request, project, transactionHash, receipt);
  } catch {
    return {
      action: "PROCESSING" as const,
      status: "TX_SUBMITTED" as const,
      requestId: request.id,
      transactionHash,
    };
  }
}

export async function retryParticipationRequest(requestId: string) {
  const [request] = await db.select().from(participationRequests).where(eq(participationRequests.id, requestId)).limit(1);
  if (!request) throw new Error("PARTICIPATION_REQUEST_NOT_FOUND");
  const [project] = await db.select().from(projects).where(eq(projects.id, request.projectId)).limit(1);
  if (!project) throw new Error("PROJECT_NOT_FOUND");
  const action = decideParticipationRecovery(request);

  if (action === "COMPLETE" || action === "POLL_TRANSACTION" || action === "SIGN") {
    return { action, requestId: request.id };
  }
  if (action === "EXPIRE_UNSIGNED" || action === "FAIL_FINAL") {
    await db.update(participationRequests).set({
      status: action === "EXPIRE_UNSIGNED" ? "EXPIRED" : "FAILED_FINAL",
      expectedMemberNumber: null,
      lastErrorCode: action === "EXPIRE_UNSIGNED" ? "SIGNATURE_EXPIRED" : "RETRY_EXHAUSTED_OR_EXPIRED",
      updatedAt: new Date(),
    }).where(eq(participationRequests.id, request.id));
    return { action, requestId: request.id };
  }
  if (action === "REFRESH_CHALLENGE") {
    const { refreshed, snapshotRow } = await refreshUnsignedParticipationRequest(request, project);
    await publishMetadataForRequest(refreshed, project, snapshotRow);
    return { action, requestId: request.id };
  }
  if (action === "RETRY_METADATA") {
    const [snapshotRow] = await db.select().from(projectSnapshots).where(eq(projectSnapshots.id, request.snapshotId)).limit(1);
    if (!snapshotRow) throw new Error("SNAPSHOT_NOT_FOUND");
    try {
      await publishMetadataForRequest(request, project, snapshotRow);
      return { action, requestId: request.id };
    } catch (error) {
      const retryCount = request.retryCount + 1;
      await db.update(participationRequests).set({
        status: retryCount >= 3 ? "FAILED_FINAL" : "FAILED_RETRYABLE",
        retryCount,
        lastErrorCode: "METADATA_PUBLICATION_FAILED",
        updatedAt: new Date(),
      }).where(eq(participationRequests.id, request.id));
      throw error;
    }
  }

  if (!request.signature || !request.expectedMemberNumber || !request.tokenUri) {
    throw new Error("PARTICIPATION_RETRY_INPUT_MISSING");
  }
  const onchainProjectId = projectIdForContract(project.slug);
  const [joined, memberCount] = await Promise.all([
    publicClient.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "hasParticipated", args: [onchainProjectId, getAddress(request.walletAddress)] }),
    publicClient.readContract({ address: contractAddress, abi: participationBadgeAbi, functionName: "projectMemberCount", args: [onchainProjectId] }),
  ]);
  if (joined) return { action: "POLL_TRANSACTION" as const, requestId: request.id };
  if (memberCount + 1n !== request.expectedMemberNumber) {
    await db.update(participationRequests).set({
      status: "FAILED_FINAL",
      lastErrorCode: "MEMBER_NUMBER_NO_LONGER_VALID",
      updatedAt: new Date(),
    }).where(eq(participationRequests.id, request.id));
    return { action: "FAIL_FINAL" as const, requestId: request.id };
  }

  const message = participationMessage(request, project.slug);
  await db.update(participationRequests).set({ status: "PROCESSING", updatedAt: new Date() }).where(eq(participationRequests.id, request.id));
  try {
    const transactionHash = await relayerClient.writeContract({
      address: contractAddress,
      abi: participationBadgeAbi,
      functionName: "joinBySig",
      args: [message.participant, message.projectId, message.snapshotHash, message.snapshotVersion, message.snapshotURI, message.memberNumber, message.tokenURI, message.nonce, message.deadline, request.signature as Hex],
    });
    await db.update(participationRequests).set({
      status: "TX_SUBMITTED",
      transactionHash,
      lastErrorCode: null,
      updatedAt: new Date(),
    }).where(eq(participationRequests.id, request.id));
    const receipt = await publicClient.waitForTransactionReceipt({ hash: transactionHash, confirmations: 1 });
    return await finalizeParticipationReceipt(request, project, transactionHash, receipt);
  } catch (error) {
    const retryCount = request.retryCount + 1;
    await db.update(participationRequests).set({
      status: retryCount >= 3 || request.deadline <= new Date() ? "FAILED_FINAL" : "FAILED_RETRYABLE",
      retryCount,
      lastErrorCode: error instanceof Error ? error.message : "RELAYER_RETRY_FAILED",
      updatedAt: new Date(),
    }).where(eq(participationRequests.id, request.id));
    throw error;
  }
}

export async function retryFailedParticipationRequests() {
  const rows = await db
    .select({ id: participationRequests.id })
    .from(participationRequests)
    .where(
      inArray(participationRequests.status, [
        "FAILED_RETRYABLE",
        "SIGNED",
        "PROCESSING",
      ]),
    );
  const results = [];
  for (const row of rows) {
    try {
      results.push(await retryParticipationRequest(row.id));
    } catch (error) {
      results.push({
        action: "ERROR" as const,
        requestId: row.id,
        error: error instanceof Error ? error.message : "UNKNOWN_RETRY_ERROR",
      });
    }
  }
  return { attempted: rows.length, results };
}
