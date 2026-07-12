import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { authenticatePrivyRequest } from "../../../../server/auth/privy";
import { db } from "../../../../server/db/client";
import { participations, projects, projectSnapshots } from "../../../../server/db/schema";

export async function GET(request: Request) {
  try {
    const auth = await authenticatePrivyRequest(request);
    const rows = await db
      .select({ participation: participations, project: projects, joinedSnapshot: projectSnapshots })
      .from(participations)
      .innerJoin(projects, eq(participations.projectId, projects.id))
      .innerJoin(projectSnapshots, eq(participations.snapshotId, projectSnapshots.id))
      .where(eq(participations.walletAddress, auth.walletAddress));
    const result = await Promise.all(rows.map(async (row) => {
      const latest = row.project.currentSnapshotId
        ? (await db.select().from(projectSnapshots).where(eq(projectSnapshots.id, row.project.currentSnapshotId)).limit(1))[0] ?? null
        : null;
      return {
        project: {
          slug: row.project.slug,
          name: row.project.name,
          heroImage: row.project.heroImage,
        },
        participation: {
          memberNumber: row.participation.memberNumber.toString(),
          tokenId: row.participation.tokenId.toString(),
          tokenUri: row.participation.tokenUri,
          transactionHash: row.participation.transactionHash,
          walletAddress: row.participation.walletAddress,
          joinedAt: row.participation.joinedAt.toISOString(),
        },
        joinedSnapshot: {
          version: row.joinedSnapshot.version,
          dataType: row.joinedSnapshot.dataType,
          gatewayUrl: row.joinedSnapshot.gatewayUrl,
          publicData: row.joinedSnapshot.publicData,
        },
        latestSnapshot: latest ? {
          version: latest.version,
          verificationStage: latest.verificationStage,
          publicData: latest.publicData,
        } : null,
      };
    }));
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
