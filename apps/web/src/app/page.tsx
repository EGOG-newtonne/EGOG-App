import { ProjectCard } from "../components/project-card";
import { SiteFooter } from "../components/site-footer";
import { listProjects } from "../server/projects/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await listProjects();
  return (
    <>
      <main className="discovery-page">
        <section className="hero-copy">
          <p className="eyebrow">Verified climate participation</p>
          <h1>Follow real project data.<br />Record your support on-chain.</h1>
          <p>
            Explore climate projects through versioned dMRV snapshots, then create a
            permanent participation record on GIWA Testnet—without buying an asset.
          </p>
        </section>
        <section aria-labelledby="projects-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Project discovery</p>
              <h2 id="projects-title">Climate projects</h2>
            </div>
            <span>{projects.length} projects</span>
          </div>
          <div className="project-grid">
            {projects.map((project) => <ProjectCard key={project.id} {...project} />)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
