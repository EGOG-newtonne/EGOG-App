import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { authenticatePrivyRequest } from "../../../../server/auth/privy";
import { db } from "../../../../server/db/client";
import { participationRequests, participations } from "../../../../server/db/schema";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticatePrivyRequest(request);
    const { id } = await context.params;
    const [row] = await db.select().from(participationRequests).where(eq(participationRequests.id, id)).limit(1);
    if (!row || row.walletAddress.toLowerCase() !== auth.walletAddress.toLowerCase()) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const [participation] = row.status === "CONFIRMED"
      ? await db.select().from(participations).where(eq(participations.requestId, row.id)).limit(1)
      : [];
    return NextResponse.json({
      id: row.id,
      status: row.status,
      transactionHash: row.transactionHash,
      memberNumber: participation?.memberNumber.toString() ?? row.expectedMemberNumber?.toString() ?? null,
      tokenId: participation?.tokenId.toString() ?? null,
      tokenUri: participation?.tokenUri ?? row.tokenUri,
      walletAddress: row.walletAddress,
      joinedAt: participation?.joinedAt.toISOString() ?? null,
      snapshotHash: row.snapshotHash,
      snapshotUri: row.snapshotUri,
      snapshotVersion: row.snapshotVersion,
      expiresAt: row.expiresAt.toISOString(),
      lastErrorCode: row.lastErrorCode,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
