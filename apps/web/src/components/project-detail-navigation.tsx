import Link from "next/link";

export type ProjectDetailTab = "overview" | "gallery";
export type EvidenceGalleryType = "field" | "sensor";

export type ProjectDetailSearchParams = {
  tab?: string | string[];
  type?: string | string[];
};

export function resolveProjectDetailView(
  searchParams: ProjectDetailSearchParams,
): {
  tab: ProjectDetailTab;
  evidenceType: EvidenceGalleryType;
} {
  return {
    tab: searchParams.tab === "gallery" ? "gallery" : "overview",
    evidenceType: searchParams.type === "sensor" ? "sensor" : "field",
  };
}

export function ProjectDetailNavigation({
  evidenceType,
  projectSlug,
  tab,
}: {
  evidenceType: EvidenceGalleryType;
  projectSlug: string;
  tab: ProjectDetailTab;
}) {
  const projectPath = `/projects/${projectSlug}`;

  return (
    <div className="project-detail-navigation">
      <nav aria-label="Project detail sections" className="project-detail-tabs">
        <Link
          aria-current={tab === "overview" ? "page" : undefined}
          href={projectPath}
          prefetch={false}
        >
          Overview
        </Link>
        <Link
          aria-current={tab === "gallery" ? "page" : undefined}
          href={`${projectPath}?tab=gallery&type=field`}
          prefetch={false}
        >
          Gallery
        </Link>
      </nav>
      {tab === "gallery" ? (
        <nav aria-label="Evidence gallery categories" className="evidence-type-tabs">
          <Link
            aria-current={evidenceType === "field" ? "page" : undefined}
            href={`${projectPath}?tab=gallery&type=field`}
            prefetch={false}
          >
            Field
          </Link>
          <Link
            aria-current={evidenceType === "sensor" ? "page" : undefined}
            href={`${projectPath}?tab=gallery&type=sensor`}
            prefetch={false}
          >
            Sensor
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
