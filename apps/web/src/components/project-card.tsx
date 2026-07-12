import { ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ProjectCardProps = {
  slug: string;
  name: string;
  location: string;
  summary: string;
  heroImage: string;
  status: "active" | "coming_soon";
  cachedMemberCount: number;
};

export function ProjectCard(project: ProjectCardProps) {
  return (
    <article className="project-card">
      <div className="project-image-wrap">
        <Image fill sizes="(max-width: 800px) 100vw, 33vw" src={project.heroImage} alt="" />
        <span className={project.status === "active" ? "status active" : "status"}>
          {project.status === "active" ? "Open for participation" : "Coming soon"}
        </span>
      </div>
      <div className="project-card-body">
        <p className="location"><MapPin size={15} /> {project.location}</p>
        <h2>{project.name}</h2>
        <p>{project.summary}</p>
        <div className="project-card-footer">
          <span>{project.cachedMemberCount} early participants</span>
          {project.status === "active" ? (
            <Link href={`/projects/${project.slug}`}>View project <ArrowRight size={16} /></Link>
          ) : (
            <span>Details unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
