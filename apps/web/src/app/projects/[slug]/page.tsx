import {
  CheckCircle2,
  Database,
  ExternalLink,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  pluralize,
  publicSnapshotSchema,
  snapshotKind,
  type ClimateMetricsSnapshot,
  type FieldEvidenceSnapshot,
} from "@egog/shared";

import { AppHeader } from "../../../components/app-header";
import { EvidenceGallery } from "../../../components/evidence-gallery";
import {
  ProjectDetailNavigation,
  resolveProjectDetailView,
  type ProjectDetailSearchParams,
} from "../../../components/project-detail-navigation";
import { SiteFooter } from "../../../components/site-footer";
import { ProjectParticipationCta } from "../../../features/participation/project-participation-cta";
import { getProjectBySlug } from "../../../server/projects/queries";

export const dynamic = "force-dynamic";

const stages = ["MONITORING", "VALIDATION", "VERIFICATION", "ISSUANCE_READY", "ISSUED"];

function formatAmount(value: string) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(value));
}

function formatForecast(forecast: ClimateMetricsSnapshot["forecastCreditVolume"]) {
  if (!forecast) return "Data pending";
  return forecast.type === "range"
    ? `${formatAmount(forecast.min)}–${formatAmount(forecast.max)}`
    : formatAmount(forecast.value);
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<ProjectDetailSearchParams>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const project = await getProjectBySlug(slug);
  if (!project?.currentSnapshot) notFound();
  const current = publicSnapshotSchema.parse(project.currentSnapshot.publicData);
  const evidence = snapshotKind(current) === "field_evidence"
    ? current as FieldEvidenceSnapshot
    : null;
  const climate = evidence ? null : current as ClimateMetricsSnapshot;
  const currentStage = stages.indexOf(current.verificationStage);
  const firstReference = project.cachedMemberCount > 0;
  const fieldMedia = evidence?.media.filter((item) => item.category === "field") ?? [];
  const sensorMedia = evidence?.media.filter((item) => item.category === "sensor") ?? [];
  const projectDetailView = resolveProjectDetailView(resolvedSearchParams);

  return (
    <>
      <AppHeader />
      <main className="project-detail-page">
        <div className="breadcrumbs"><Link href="/">Projects</Link><span>/</span><span>{project.name}</span></div>
        <section className="project-title-row">
          <div>
            <span className={evidence ? "field-evidence-pill" : "demo-pill"}>
              {evidence ? "Field evidence · Carbon data pending" : "Demonstration data"}
            </span>
            <h1>{project.name}</h1>
            <p className="location"><MapPin size={16} /> {project.location}</p>
          </div>
          <p>{project.summary}</p>
        </section>
        <div className="detail-layout">
          <div className="detail-main">
            <div className={evidence ? "hero-image hero-image-jeju" : "hero-image"}>
              <Image
                alt={evidence ? "Jeju ERW field monitoring site with planted rows and monitoring cabinets" : `${project.name} project site`}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 65vw"
                src={project.heroImage}
              />
            </div>
            <aside className={evidence ? "evidence-notice" : "demo-notice"}>
              <Database size={21} />
              <div>
                <strong>{evidence ? "Field evidence" : "Demonstration data"}</strong>
                <p>{project.demonstrationNotice}</p>
              </div>
            </aside>
            <section className="kpi-grid" aria-label="Latest project metrics">
              {climate ? <article><span>Monitored reduction</span><strong>{formatAmount(climate.monitoredReduction.value)}</strong><small>tCO₂e · demonstration</small></article> : null}
              <article><span>Project stage</span><strong className="text-value">{current.verificationStage}</strong><small>{current.verificationSourceStatus}</small></article>
              {climate ? <article><span>Forecast volume</span><strong className="text-value">{formatForecast(climate.forecastCreditVolume)}</strong><small>tCO₂e · forecast</small></article> : null}
              <article><span>{evidence ? "Evidence snapshot" : "Latest snapshot"}</span><strong>v{current.version}</strong><small>Published {new Date(current.publishedAt).toLocaleDateString("en-GB")}</small></article>
              {evidence ? <article><span>Published evidence</span><strong>{evidence.media.length}</strong><small>4 field · 4 sensor images</small></article> : null}
              {evidence ? <article><span>Carbon data</span><strong className="text-value">Data pending</strong><small>No removal or credit figures published</small></article> : null}
            </section>
            {evidence ? (
              <ProjectDetailNavigation
                evidenceType={projectDetailView.evidenceType}
                projectSlug={project.slug}
                tab={projectDetailView.tab}
              />
            ) : null}
            {climate ? <section className="content-card">
              <div className="card-heading"><div><p className="eyebrow">Snapshot history</p><h2>Monitored reduction trend</h2></div><span>tCO₂e</span></div>
              <div className="trend-chart">
                {project.snapshots.map((snapshot) => {
                  const data = publicSnapshotSchema.parse(snapshot.publicData) as ClimateMetricsSnapshot;
                  const height = Math.max(12, (Number(data.monitoredReduction.value) / Number(climate.monitoredReduction.value)) * 100);
                  return <div className="bar-group" key={snapshot.id}><span>{formatAmount(data.monitoredReduction.value)}</span><div className="bar-track"><div className="bar" style={{ height: `${height}%` }} /></div><small>v{snapshot.version}</small></div>;
                })}
              </div>
            </section> : null}
            {evidence && projectDetailView.tab === "gallery" ? (
              projectDetailView.evidenceType === "field" ? (
                <EvidenceGallery
                  description="Original site photography showing the field layout, installed soil probes, and weather monitoring hardware."
                  media={fieldMedia}
                  title="Field Gallery"
                />
              ) : (
                <EvidenceGallery
                  description="Original Newtonne ZENTRA Cloud screens are published as visual evidence. Values are not transcribed or converted into carbon outcomes."
                  media={sensorMedia}
                  title="Sensor Monitoring Evidence"
                />
              )
            ) : null}
            {!evidence || projectDetailView.tab === "overview" ? <section className="content-card">
              <div className="card-heading"><div><p className="eyebrow">Project lifecycle</p><h2>Verification timeline</h2></div></div>
              <ol className="stage-list">
                {stages.map((stage, index) => <li className={index <= currentStage ? "reached" : ""} key={stage}><span aria-hidden="true">{index <= currentStage ? <CheckCircle2 size={20} /> : index + 1}</span><div><strong>{stage.replace("_", " ")}</strong><small>{index === currentStage ? "Current demonstration stage" : index < currentStage ? "Reached in demonstration history" : "Future stage"}</small></div></li>)}
              </ol>
            </section> : null}
            {!evidence || projectDetailView.tab === "overview" ? <section className="content-card data-details">
              <div className="card-heading"><div><p className="eyebrow">Data provenance</p><h2>Source details</h2></div><ShieldCheck size={25} /></div>
              <dl>
                <div><dt>Source</dt><dd>{current.sourceName}</dd></div>
                <div><dt>Source version</dt><dd>{current.sourceVersion}</dd></div>
                <div><dt>{evidence ? "Evidence captured at" : "Measured at"}</dt><dd>{new Date(current.measuredAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC</dd></div>
                {evidence ? <div><dt>Evidence files</dt><dd>{evidence.media.length} originals · SHA-256 recorded</dd></div> : null}
                {evidence ? <div><dt>Carbon data status</dt><dd>Pending — no quantified removal or credit data published</dd></div> : null}
                {climate ? <div><dt>Registry</dt><dd>{climate.registry}</dd></div> : null}
                {climate ? <div><dt>Methodology</dt><dd>{climate.methodology}</dd></div> : null}
                <div><dt>Verification note</dt><dd>{current.verificationNote}</dd></div>
              </dl>
            </section> : null}
            {!evidence || projectDetailView.tab === "overview" ? <section className="content-card onchain-card">
              <div><Database size={24} /><div><p className="eyebrow">On-chain snapshot status</p><h2>{firstReference ? "Referenced on GIWA Testnet" : "Not yet referenced on-chain"}</h2><p>The snapshot becomes referenced when a participant signs and mints a badge.</p></div></div>
              {firstReference ? <dl className="reference-facts"><div><dt>First referenced</dt><dd>{project.firstReferencedAt ? new Date(project.firstReferencedAt).toLocaleString("en-GB", { timeZone: "UTC" }) : "Pending sync"} UTC</dd></div><div><dt>Participation records</dt><dd>{project.cachedMemberCount}</dd></div></dl> : null}
              <a href={project.currentSnapshot.gatewayUrl} target="_blank" rel="noreferrer">View public Snapshot JSON <ExternalLink size={15} /></a>
            </section> : null}
          </div>
          <aside className="participation-panel">
            <p className="eyebrow">Early participation</p>
            <strong className="participant-count">{project.cachedMemberCount}</strong>
            <span>{pluralize(project.cachedMemberCount, "participant")} on GIWA Testnet</span>
            <hr />
            <div className="snapshot-summary"><span>Current snapshot</span><strong>Version {current.version}</strong><small>{project.currentSnapshot.snapshotHash.slice(0, 12)}…{project.currentSnapshot.snapshotHash.slice(-8)}</small></div>
            <div className="benefit-list"><h3>What you receive now</h3><p><CheckCircle2 size={16} /> On-chain participation record</p><p><CheckCircle2 size={16} /> Non-transferable participant badge</p><p><CheckCircle2 size={16} /> Participation dashboard</p></div>
            <div className="future-list"><h3>Potential future opportunities</h3><p>Project updates · Beta invitations · Community access</p></div>
            <ProjectParticipationCta projectSlug={project.slug} />
            <small className="legal-note">Future opportunities are not guaranteed and do not represent an investment, financial return, or ownership of carbon credits.</small>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
