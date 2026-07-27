import { notFound } from "next/navigation";

import { AppLink } from "../../../components/app-link";
import { ParticipationFlow } from "../../../features/participation/participation-flow";
import { getProjectBySlug } from "../../../server/projects/queries";

export const dynamic = "force-dynamic";

export default async function ParticipatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project?.currentSnapshot || project.status !== "active") notFound();
  return (
    <>
      <main className="participate-page">
        <AppLink className="back-link" href={`/projects/${slug}`}>← Back to project</AppLink>
        <ParticipationFlow
          projectSlug={project.slug}
          projectName={project.name}
          snapshotVersion={project.currentSnapshot.version}
          snapshotHash={project.currentSnapshot.snapshotHash}
          snapshotUri={project.currentSnapshot.snapshotUri}
          dataType={project.currentSnapshot.dataType}
        />
      </main>
    </>
  );
}
