import { AppLink } from "./app-link";

export function ProjectPhotoNavigation({
  projectSlug,
  tab,
}: {
  projectSlug: string;
  tab: "overview" | "gallery";
}) {
  return (
    <nav aria-label="Project detail sections" className="project-detail-tabs">
      <AppLink aria-current={tab === "overview" ? "page" : undefined} href={`/projects/${projectSlug}`}>
        Overview
      </AppLink>
      <AppLink
        aria-current={tab === "gallery" ? "page" : undefined}
        href={`/projects/${projectSlug}?tab=gallery`}
        prefetch={false}
      >
        Gallery
      </AppLink>
    </nav>
  );
}
