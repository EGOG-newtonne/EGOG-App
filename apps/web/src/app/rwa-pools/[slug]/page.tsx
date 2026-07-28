import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "../../../components/site-footer";
import { RwaPoolPreview } from "../../../features/rwa-pool/rwa-pool-preview";
import { getRwaPoolScenario } from "../../../features/rwa-pool/scenarios";
import { getProjectBySlug } from "../../../server/projects/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const scenario = getRwaPoolScenario(slug);

  if (!scenario) return {};

  return {
    alternates: {
      canonical: `/rwa-pools/${slug}`,
    },
    description: `Preview the future climate RWA DeFi pool structure for ${scenario.projectName}.`,
    openGraph: {
      description: `Preview the future climate RWA DeFi pool structure for ${scenario.projectName}.`,
      title: `${scenario.projectName} RWA Pool Preview | EGOG`,
      url: `/rwa-pools/${slug}`,
    },
    title: `${scenario.projectName} RWA Pool Preview | EGOG`,
  };
}

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
