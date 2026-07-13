import { timingSafeEqual } from "node:crypto";

export function isAuthorizedOnchainSyncRequest(request: Request, secret: string) {
  const provided = request.headers.get("authorization");
  if (provided === null) return false;

  const expectedBytes = Buffer.from(`Bearer ${secret}`, "utf8");
  const providedBytes = Buffer.from(provided, "utf8");
  if (expectedBytes.length !== providedBytes.length) return false;

  return timingSafeEqual(expectedBytes, providedBytes);
}
