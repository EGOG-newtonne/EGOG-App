import { notFound } from "next/navigation";

import { SiteFooter } from "../../../components/site-footer";
import { RwaPoolPreview } from "../../../features/rwa-pool/rwa-pool-preview";
import { getRwaPoolScenario } from "../../../features/rwa-pool/scenarios";
import { getProjectBySlug } from "../../../server/projects/queries";

export const dynamic = "force-dynamic";

export default async function RwaPoolPreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const scenario = getRwaPoolScenario(slug);
  if (!scenario) notFound();

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <RwaPoolPreview scenario={scenario} />
      <SiteFooter />
    </>
  );
}
