import { createHash } from "node:crypto";

export function projectAdvisoryLockId(projectId: string) {
  const digest = createHash("sha256").update(`egog:project-mint:${projectId}`).digest("hex");
  return BigInt.asIntN(64, BigInt(`0x${digest.slice(0, 16)}`));
}
