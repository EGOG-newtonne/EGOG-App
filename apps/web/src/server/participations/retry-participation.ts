import type { participationRequests } from "../db/schema";

type RecoveryInput = Pick<
  typeof participationRequests.$inferSelect,
  "status" | "tokenUri" | "signature" | "transactionHash" | "deadline" | "expiresAt" | "retryCount"
>;

export type ParticipationRecoveryAction =
  | "COMPLETE"
  | "SIGN"
  | "RETRY_METADATA"
  | "RETRY_TRANSACTION"
  | "POLL_TRANSACTION"
  | "REFRESH_CHALLENGE"
  | "EXPIRE_UNSIGNED"
  | "FAIL_FINAL";

export function decideParticipationRecovery(
  request: RecoveryInput,
  now = new Date(),
): ParticipationRecoveryAction {
  if (request.status === "CONFIRMED") return "COMPLETE";
  if (request.status === "TX_SUBMITTED") return "POLL_TRANSACTION";
  if (request.status === "PROCESSING") {
    return request.transactionHash ? "POLL_TRANSACTION" : request.signature ? "RETRY_TRANSACTION" : "FAIL_FINAL";
  }
  if (request.status === "SIGNED") {
    return request.signature && request.deadline > now ? "RETRY_TRANSACTION" : "FAIL_FINAL";
  }
  if (request.status === "FAILED_FINAL" || request.retryCount >= 3) return "FAIL_FINAL";

  if (request.status === "FAILED_RETRYABLE") {
    if (!request.tokenUri) return request.deadline <= now
      ? request.expiresAt <= now ? "EXPIRE_UNSIGNED" : "REFRESH_CHALLENGE"
      : "RETRY_METADATA";
    if (request.signature) return request.deadline <= now ? "FAIL_FINAL" : "RETRY_TRANSACTION";
  }

  if (request.deadline <= now) return request.expiresAt <= now ? "EXPIRE_UNSIGNED" : "REFRESH_CHALLENGE";
  return request.tokenUri ? "SIGN" : "RETRY_METADATA";
}
