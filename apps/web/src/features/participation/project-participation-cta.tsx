import { ArrowRight } from "lucide-react";

import { AppLink } from "../../components/app-link";

export function ProjectParticipationCta({ projectSlug }: { projectSlug: string }) {
  return (
    <AppLink className="primary-cta" href={`/rwa-pools/${projectSlug}`}>
      Explore RWA DeFi Pool <ArrowRight size={18} />
    </AppLink>
  );
}
