import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "../db/client";
import { participations, projects, projectSnapshots } from "../db/schema";

export async function listProjects() {
  return db.select().from(projects).orderBy(asc(projects.name));
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
