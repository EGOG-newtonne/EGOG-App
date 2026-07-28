import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";

import { pluralize } from "@egog/shared";

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
  const card = (
    <article className="project-card">
      <div className="project-image-wrap">
        <Image
          fill
          sizes="(max-width: 800px) 100vw, 33vw"
          src={projectHeroImage(project.slug, project.heroImage)}
          alt=""
        />
        <span className={project.status === "active" ? "status active" : "status"}>
          {project.status === "active" ? "Open for participation" : "Coming soon"}
        </span>
      </div>
      <div className="project-card-body">
        <p className="location"><MapPin size={15} /> {project.location}</p>
        <h2>{project.name}</h2>
        <p>{project.summary}</p>
        <div className="project-card-footer">
          <span>{pluralize(project.cachedMemberCount, "early participant")}</span>
          {project.status === "active" ? (
            <span className="view-project">View project <ArrowRight size={16} /></span>
          ) : (
            <span>Details unavailable</span>
          )}
        </div>
      </div>
    </article>
  );

  if (project.status === "active") {
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
