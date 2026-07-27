import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "../db/client";
import { participations, projects, projectSnapshots } from "../db/schema";

export async function listProjects() {
  const rows = await db
    .select({ project: projects, currentSnapshotData: projectSnapshots.publicData })
    .from(projects)
    .leftJoin(projectSnapshots, eq(projects.currentSnapshotId, projectSnapshots.id))
    .orderBy(asc(projects.name));
  return rows.map(({ currentSnapshotData, project }) => ({
    ...project,
    snapshotKind:
      currentSnapshotData &&
      typeof currentSnapshotData === "object" &&
      "snapshotKind" in currentSnapshotData &&
      currentSnapshotData.snapshotKind === "field_evidence"
        ? "field_evidence" as const
        : "climate_metrics" as const,
  }));
}

export async function getProjectBySlug(slug: string) {
  const [project] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  if (!project) return null;
  const snapshots = await db
    .select()
    .from(projectSnapshots)
    .where(eq(projectSnapshots.projectId, project.id))
    .orderBy(asc(projectSnapshots.version));
  const current = snapshots.find((snapshot) => snapshot.id === project.currentSnapshotId) ?? null;
  const [firstParticipation] = await db
    .select({ joinedAt: participations.joinedAt })
    .from(participations)
    .where(eq(participations.projectId, project.id))
    .orderBy(asc(participations.joinedAt))
    .limit(1);
  return {
    ...project,
    snapshots,
    currentSnapshot: current,
    firstReferencedAt: firstParticipation?.joinedAt ?? null,
  };
}
