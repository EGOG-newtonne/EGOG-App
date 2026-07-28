import { ArrowRight, CheckCircle2, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";

import { pluralize } from "@egog/shared";

import { projectMethodology } from "../content/project-methodologies";
import { projectHeroImage } from "../content/project-media";
import { AppLink } from "./app-link";

type ProjectCardProps = {
  slug: string;
  name: string;
  location: string;
  summary: string;
  heroImage: string;
  status: "active" | "coming_soon";
  cachedMemberCount: number;
  snapshotKind: "climate_metrics" | "field_evidence";
};

export function ProjectCard(project: ProjectCardProps) {
  const methodology = projectMethodology(project.slug);
  const active = project.status === "active";
  const card = (
    <article className={`project-card ${active ? "project-card-active" : "project-card-coming-soon"}`}>
      <div className="project-image-wrap">
        <Image
          fill
          sizes="(max-width: 800px) 100vw, 33vw"
          src={projectHeroImage(project.slug, project.heroImage)}
          alt=""
        />
      </div>
      <div className={`project-status-band ${active ? "project-status-band-active" : "project-status-band-coming-soon"}`}>
        {active ? <CheckCircle2 aria-hidden="true" size={17} /> : null}
        <span>{active ? "Open for participation" : "Coming soon"}</span>
      </div>
      <div className="project-card-body">
        <p className="location"><MapPin size={15} /> {project.location}</p>
        <h2>{project.name}</h2>
        <p>{project.summary}</p>
        <div className="project-card-footer">
          <span>{pluralize(project.cachedMemberCount, "early participant")}</span>
          {active ? (
            <span className="view-project">View project <ArrowRight size={16} /></span>
          ) : methodology ? (
            <a
              aria-label={`Open ${methodology.name} in a new tab`}
              className="project-methodology-link"
              href={methodology.url}
              rel="noreferrer"
              target="_blank"
            >
              View methodology <ExternalLink aria-hidden="true" size={14} />
            </a>
          ) : (
            <span>Details unavailable</span>
          )}
        </div>
      </div>
    </article>
  );

  if (active) {
    return (
      <AppLink
        aria-label={`View ${project.name}`}
        className="project-card-link"
        href={`/projects/${project.slug}`}
      >
        {card}
      </AppLink>
    );
  }

  return card;
}
