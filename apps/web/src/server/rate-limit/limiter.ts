import "server-only";

import { and, count, eq, gte, sql } from "drizzle-orm";

import { db } from "../db/client";
import { rateLimitEvents } from "../db/schema";
import { serverEnvironment } from "../../env/env.server";
import { hashRateLimitKey, rateLimitLockId } from "./hash-rate-key";

type LimitRule = {
  keyType: "USER" | "WALLET" | "IP" | "GLOBAL";
  value: string;
  maximum: number;
  windowMs: number;
};

export async function enforceParticipationRateLimits(
  rules: readonly LimitRule[],
  action = "participation_challenge",
) {
  for (const rule of rules) {
    const keyHash = hashRateLimitKey(serverEnvironment.CRON_SECRET, rule.value);
    const blocked = await db.transaction(async (transaction) => {
      await transaction.execute(sql`select pg_advisory_xact_lock(${rateLimitLockId(keyHash)})`);
      const since = new Date(Date.now() - rule.windowMs);
      const [result] = await transaction
        .select({ total: count() })
        .from(rateLimitEvents)
        .where(
          and(
            eq(rateLimitEvents.keyType, rule.keyType),
            eq(rateLimitEvents.keyHash, keyHash),
            eq(rateLimitEvents.action, action),
            gte(rateLimitEvents.createdAt, since),
            eq(rateLimitEvents.blocked, false),
          ),
        );
      const isBlocked = Number(result?.total ?? 0) >= rule.maximum;
      await transaction.insert(rateLimitEvents).values({
        keyType: rule.keyType,
        keyHash,
        action,
        blocked: isBlocked,
        reason: isBlocked ? `${rule.keyType}_RATE_LIMIT` : null,
      });
      return isBlocked;
    });
    if (blocked) throw new Error(`${rule.keyType}_RATE_LIMIT`);
  }
}
