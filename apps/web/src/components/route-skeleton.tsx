type RouteSkeletonVariant =
  | "discovery"
  | "project"
  | "rwa-pool"
  | "participation"
  | "account"
  | "legal";

const loadingLabels: Record<RouteSkeletonVariant, string> = {
  discovery: "Loading project discovery",
  project: "Loading project details",
  "rwa-pool": "Loading Climate RWA Pool Preview",
  participation: "Loading participation",
  account: "Loading My Participation",
  legal: "Loading legal document",
};

function Block({
  className = "",
}: {
  className?: string;
}) {
  return <span className={`skeleton-block ${className}`} />;
}

function LoadingStatus({ variant }: { variant: RouteSkeletonVariant }) {
  return (
    <span className="sr-only" role="status">
      {loadingLabels[variant]}…
    </span>
  );
}

function DiscoverySkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label={loadingLabels.discovery}
      className="discovery-page route-skeleton"
    >
      <LoadingStatus variant="discovery" />
      <div aria-hidden="true">
        <section className="skeleton-discovery-hero">
          <Block className="skeleton-line skeleton-line-xs" />
          <Block className="skeleton-heading skeleton-heading-display" />
          <Block className="skeleton-heading skeleton-heading-display skeleton-width-70" />
          <Block className="skeleton-line skeleton-width-60" />
          <Block className="skeleton-line skeleton-width-45" />
        </section>
        <section>
          <div className="skeleton-section-heading">
            <div>
              <Block className="skeleton-line skeleton-line-xs" />
              <Block className="skeleton-heading skeleton-heading-lg" />
            </div>
            <Block className="skeleton-line skeleton-width-15" />
          </div>
          <div className="skeleton-project-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <article className="skeleton-card skeleton-project-card" key={index}>
                <Block className="skeleton-project-image" />
                <div className="skeleton-card-body">
                  <Block className="skeleton-line skeleton-width-35" />
                  <Block className="skeleton-heading skeleton-heading-md skeleton-width-70" />
                  <Block className="skeleton-line" />
                  <Block className="skeleton-line skeleton-width-80" />
                  <Block className="skeleton-line skeleton-width-55" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProjectSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label={loadingLabels.project}
      className="project-detail-page route-skeleton"
    >
      <LoadingStatus variant="project" />
      <div aria-hidden="true">
        <Block className="skeleton-line skeleton-line-xs skeleton-width-20 skeleton-breadcrumb" />
        <section className="skeleton-project-title">
          <div>
            <Block className="skeleton-pill" />
            <Block className="skeleton-heading skeleton-heading-display skeleton-width-75" />
            <Block className="skeleton-line skeleton-width-35" />
          </div>
          <div>
            <Block className="skeleton-line" />
            <Block className="skeleton-line skeleton-width-90" />
            <Block className="skeleton-line skeleton-width-65" />
          </div>
        </section>
        <div className="skeleton-detail-layout">
          <div className="skeleton-detail-main">
            <Block className="skeleton-hero" />
            <div className="skeleton-card skeleton-notice">
              <Block className="skeleton-icon" />
              <div>
                <Block className="skeleton-line skeleton-width-30" />
                <Block className="skeleton-line skeleton-width-80" />
              </div>
            </div>
            <div className="skeleton-kpi-grid">
              {Array.from({ length: 4 }, (_, index) => (
                <article className="skeleton-card skeleton-kpi" key={index}>
                  <Block className="skeleton-line skeleton-line-xs skeleton-width-70" />
                  <Block className="skeleton-heading skeleton-heading-md skeleton-width-55" />
                  <Block className="skeleton-line skeleton-line-xs skeleton-width-80" />
                </article>
              ))}
            </div>
            <section className="skeleton-card skeleton-content-card">
              <Block className="skeleton-line skeleton-line-xs skeleton-width-25" />
              <Block className="skeleton-heading skeleton-heading-lg skeleton-width-55" />
              <Block className="skeleton-content-visual" />
            </section>
            <section className="skeleton-card skeleton-content-card">
              <Block className="skeleton-heading skeleton-heading-lg skeleton-width-45" />
              <Block className="skeleton-line" />
              <Block className="skeleton-line skeleton-width-85" />
              <Block className="skeleton-line skeleton-width-70" />
            </section>
          </div>
          <aside className="skeleton-card skeleton-participation-panel">
            <Block className="skeleton-line skeleton-line-xs skeleton-width-45" />
            <Block className="skeleton-heading skeleton-heading-xl skeleton-width-25" />
            <Block className="skeleton-line skeleton-width-70" />
            <div className="skeleton-divider" />
            <Block className="skeleton-line skeleton-width-45" />
            <Block className="skeleton-heading skeleton-heading-md skeleton-width-65" />
            <Block className="skeleton-line" />
            <Block className="skeleton-line skeleton-width-85" />
            <Block className="skeleton-action" />
          </aside>
        </div>
      </div>
    </main>
  );
}

function ParticipationSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label={loadingLabels.participation}
      className="participate-page route-skeleton"
    >
      <LoadingStatus variant="participation" />
      <div aria-hidden="true">
        <Block className="skeleton-line skeleton-width-20 skeleton-back-link" />
        <div className="skeleton-stepper">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index}>
              <Block className="skeleton-step" />
              <Block className="skeleton-line skeleton-line-xs skeleton-width-55" />
            </div>
          ))}
        </div>
        <section className="skeleton-card skeleton-flow-card">
          <Block className="skeleton-line skeleton-line-xs skeleton-width-25" />
          <Block className="skeleton-heading skeleton-heading-display skeleton-width-70" />
          <Block className="skeleton-line" />
          <Block className="skeleton-line skeleton-width-75" />
          <div className="skeleton-review-grid">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index}>
                <Block className="skeleton-line skeleton-line-xs skeleton-width-55" />
                <Block className="skeleton-line skeleton-width-80" />
              </div>
            ))}
          </div>
          <Block className="skeleton-action" />
        </section>
      </div>
    </main>
  );
}

function RwaPoolSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label={loadingLabels["rwa-pool"]}
      className="rwa-preview-page route-skeleton"
    >
      <LoadingStatus variant="rwa-pool" />
      <div aria-hidden="true">
        <Block className="skeleton-line skeleton-line-xs skeleton-width-20 skeleton-breadcrumb" />
        <section className="skeleton-project-title">
          <div>
            <Block className="skeleton-line skeleton-line-xs skeleton-width-35" />
            <Block className="skeleton-heading skeleton-heading-display skeleton-width-75" />
            <Block className="skeleton-line skeleton-width-35" />
          </div>
          <Block className="skeleton-pill" />
        </section>
        <div className="skeleton-card skeleton-notice">
          <Block className="skeleton-icon" />
          <div>
            <Block className="skeleton-line skeleton-width-45" />
            <Block className="skeleton-line skeleton-width-80" />
          </div>
        </div>
        <div className="skeleton-detail-layout skeleton-rwa-layout">
          <div className="skeleton-detail-main">
            <div className="skeleton-kpi-grid">
              {Array.from({ length: 4 }, (_, index) => (
                <article className="skeleton-card skeleton-kpi" key={index}>
                  <Block className="skeleton-line skeleton-line-xs skeleton-width-70" />
                  <Block className="skeleton-heading skeleton-heading-md skeleton-width-55" />
                  <Block className="skeleton-line skeleton-line-xs skeleton-width-80" />
                </article>
              ))}
            </div>
            <section className="skeleton-card skeleton-content-card skeleton-rwa-chart">
              <Block className="skeleton-line skeleton-line-xs skeleton-width-25" />
              <Block className="skeleton-heading skeleton-heading-lg skeleton-width-65" />
              <Block className="skeleton-content-visual" />
            </section>
            <section className="skeleton-card skeleton-content-card">
              <Block className="skeleton-heading skeleton-heading-lg skeleton-width-45" />
              <Block className="skeleton-line" />
              <Block className="skeleton-line skeleton-width-85" />
            </section>
          </div>
          <aside className="skeleton-card skeleton-participation-panel">
            <Block className="skeleton-line skeleton-line-xs skeleton-width-45" />
            <Block className="skeleton-heading skeleton-heading-lg skeleton-width-75" />
            <Block className="skeleton-content-visual skeleton-rwa-selector" />
            <div className="skeleton-divider" />
            <Block className="skeleton-line skeleton-width-55" />
            <Block className="skeleton-heading skeleton-heading-md skeleton-width-85" />
            <Block className="skeleton-action" />
          </aside>
        </div>
      </div>
    </main>
  );
}

export function AccountSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label={loadingLabels.account}
      className="account-layout route-skeleton account-route-skeleton"
    >
      <LoadingStatus variant="account" />
      <div aria-hidden="true">
        <section className="skeleton-account-heading">
          <div>
            <Block className="skeleton-line skeleton-line-xs skeleton-width-35" />
            <Block className="skeleton-heading skeleton-heading-display skeleton-width-75" />
            <Block className="skeleton-line skeleton-width-80" />
          </div>
          <div className="skeleton-card skeleton-wallet-card">
            <Block className="skeleton-line skeleton-line-xs skeleton-width-40" />
            <Block className="skeleton-heading skeleton-heading-md skeleton-width-60" />
            <Block className="skeleton-line" />
          </div>
        </section>
        <article className="skeleton-card skeleton-record">
          <Block className="skeleton-record-art" />
          <div className="skeleton-card-body">
            <Block className="skeleton-pill" />
            <Block className="skeleton-heading skeleton-heading-lg skeleton-width-55" />
            <Block className="skeleton-line skeleton-width-45" />
            <div className="skeleton-divider" />
            <Block className="skeleton-line" />
            <Block className="skeleton-line skeleton-width-90" />
            <Block className="skeleton-line skeleton-width-70" />
          </div>
        </article>
        <section className="skeleton-card skeleton-account-setting">
          <div>
            <Block className="skeleton-heading skeleton-heading-md skeleton-width-45" />
            <Block className="skeleton-line skeleton-width-80" />
          </div>
          <Block className="skeleton-action skeleton-action-small" />
        </section>
      </div>
    </div>
  );
}

function AccountRouteSkeleton() {
  return (
    <main className="account-page">
      <AccountSkeleton />
    </main>
  );
}

function LegalSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label={loadingLabels.legal}
      className="legal-page route-skeleton"
    >
      <LoadingStatus variant="legal" />
      <div aria-hidden="true">
        <Block className="skeleton-line skeleton-line-xs skeleton-width-20" />
        <Block className="skeleton-heading skeleton-heading-display skeleton-width-65" />
        <Block className="skeleton-line skeleton-width-30 skeleton-legal-updated" />
        <section className="skeleton-card skeleton-legal-card">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="skeleton-legal-section" key={index}>
              <Block className="skeleton-heading skeleton-heading-md skeleton-width-40" />
              <Block className="skeleton-line" />
              <Block className="skeleton-line skeleton-width-90" />
              <Block className="skeleton-line skeleton-width-70" />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export function RouteSkeleton({
  variant,
}: {
  variant: RouteSkeletonVariant;
}) {
  switch (variant) {
    case "discovery":
      return <DiscoverySkeleton />;
    case "project":
      return <ProjectSkeleton />;
    case "rwa-pool":
      return <RwaPoolSkeleton />;
    case "participation":
      return <ParticipationSkeleton />;
    case "account":
      return <AccountRouteSkeleton />;
    case "legal":
      return <LegalSkeleton />;
  }
}
