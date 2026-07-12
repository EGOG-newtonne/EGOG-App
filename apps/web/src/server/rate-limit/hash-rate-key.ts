import { createHmac } from "node:crypto";

export function hashRateLimitKey(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function rateLimitLockId(keyHash: string) {
  return BigInt.asIntN(64, BigInt(`0x${keyHash.slice(0, 16)}`));
}
