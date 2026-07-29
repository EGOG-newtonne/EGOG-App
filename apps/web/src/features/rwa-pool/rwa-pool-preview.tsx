"use client";

import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleGauge,
  Coins,
  Info,
  Leaf,
  MapPin,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { AppLink } from "../../components/app-link";
import {
  getRwaPoolProjection,
  type RwaPoolMetric,
  type RwaPoolScenario,
  rwaPoolScenarios,
} from "./scenarios";

type ParticipationRecord = {
  project: { slug: string };
  participation: {
    memberNumber: string;
    tokenId: string;
  };
};

const metricTabs: ReadonlyArray<{
  id: RwaPoolMetric;
  label: string;
}> = [
  { id: "price", label: "Reference price" },
  { id: "apy", label: "APY" },
  { id: "tvl", label: "Pool volume" },
];

function formatCompactUsdc(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    notation: "compact",
  }).format(value)} USDC`;
}

function formatMetricValue(metric: RwaPoolMetric, value: number) {
  if (metric === "price") return `${value.toFixed(2)} USDC / tCO₂e`;
  if (metric === "apy") return `${value.toFixed(1)}%`;
  return formatCompactUsdc(value);
}

function ProjectionChart({
  metric,
  scenario,
}: {
  metric: RwaPoolMetric;
  scenario: RwaPoolScenario;
}) {
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const data = getRwaPoolProjection(scenario, metric);
  const values = data.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coordinates = data.map((point, index) => {
    const x = 76 + (index / (data.length - 1)) * 600;
    const y = 196 - ((point.value - min) / range) * 144;
    return { x, y };
  });
  const points = coordinates.map(({ x, y }) => `${x},${y}`).join(" ");
  const yTicks = [1, 0.66, 0.33, 0].map((ratio) => ({
    value: min + range * ratio,
    y: 196 - ratio * 144,
  }));

  function formatAxisValue(value: number) {
    if (metric === "apy") return `${value.toFixed(1)}%`;
    if (metric === "price") return value.toFixed(2);
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(value);
  }

  return (
    <div className="rwa-chart-visual">
      <svg
        aria-label={`${metricTabs.find((tab) => tab.id === metric)?.label} illustrative twelve-month projection`}
        role="img"
        viewBox="0 0 700 230"
      >
        <title>Illustrative 12-month projection</title>
        <desc>
          Scenario values rise toward the configured final illustrative value.
          This is not historical or live market data.
        </desc>
        {yTicks.map((tick) => (
          <g key={tick.y}>
            <line className="rwa-chart-gridline" x1="76" x2="676" y1={tick.y} y2={tick.y} />
            <text className="rwa-chart-axis-label" textAnchor="end" x="64" y={tick.y + 4}>
              {formatAxisValue(tick.value)}
            </text>
          </g>
        ))}
        <text className="rwa-chart-axis-unit" x="76" y="24">
          {metric === "price" ? "USDC / tCO₂e" : metric === "apy" ? "%" : "USDC"}
        </text>
        <polyline className="rwa-chart-line" fill="none" points={points} />
        {data.map((point, index) => {
          const { x, y } = coordinates[index]!;
          const tooltipX = Math.min(520, Math.max(76, x - 78));
          const tooltipY = y < 86 ? y + 18 : y - 60;
          const isActive = activePoint === index;
          return (
            <g
              aria-label={`Month ${point.month}: ${formatMetricValue(metric, point.value)}`}
              className={isActive ? "rwa-chart-point-group is-active" : "rwa-chart-point-group"}
              key={point.month}
              onBlur={() => setActivePoint((current) => current === index ? null : current)}
              onClick={() => setActivePoint(index)}
              onFocus={() => setActivePoint(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActivePoint(index);
                }
              }}
              onMouseEnter={() => setActivePoint(index)}
              onMouseLeave={() => setActivePoint((current) => current === index ? null : current)}
              role="button"
              tabIndex={0}
            >
              <circle className="rwa-chart-point-target" cx={x} cy={y} r="12" />
              <circle
                className={index === data.length - 1 ? "rwa-chart-point rwa-chart-point-current" : "rwa-chart-point"}
                cx={x}
                cy={y}
                r={index === data.length - 1 ? 5 : 3}
              />
              {isActive ? (
                <g className="rwa-chart-tooltip" pointerEvents="none">
                  <rect height="44" rx="8" width="156" x={tooltipX} y={tooltipY} />
                  <text x={tooltipX + 10} y={tooltipY + 17}>Month {point.month}</text>
                  <text className="rwa-chart-tooltip-value" x={tooltipX + 10} y={tooltipY + 34}>
                    {formatMetricValue(metric, point.value)}
                  </text>
                </g>
              ) : null}
            </g>
          );
        })}
        {[1, 4, 7, 10, 12].map((month) => {
          const x = 76 + ((month - 1) / 11) * 600;
          return (
            <text className="rwa-chart-month" key={month} textAnchor="middle" x={x} y="222">
              M{month}
            </text>
          );
        })}
      </svg>
      <div className="rwa-chart-range" aria-hidden="true">
        <span>Starting scenario<br /><strong>{formatMetricValue(metric, data[0]!.value)}</strong></span>
        <span>Month 12<br /><strong>{formatMetricValue(metric, data.at(-1)?.value ?? 0)}</strong></span>
      </div>
    </div>
  );
}

function ScenarioMetric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rwa-metric-card">
      <div className="rwa-metric-label">{icon}<span>{label}</span></div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export function RwaPoolPreview({
  scenario,
}: {
  scenario: RwaPoolScenario;
}) {
  const { authenticated, getAccessToken, ready } = usePrivy();
  const [metric, setMetric] = useState<RwaPoolMetric>("price");
  const [participation, setParticipation] = useState<ParticipationRecord | null>(null);
  const [participationState, setParticipationState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const chartPanelId = useId();

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      setParticipation(null);
      setParticipationState("loaded");
      return;
    }

    let cancelled = false;
    setParticipationState("loading");
    void getAccessToken()
      .then(async (token) => {
        if (!token) throw new Error("Missing access token");
        const response = await fetch("/api/me/participations", {
          headers: { authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Unable to load participation");
        return response.json() as Promise<ParticipationRecord[]>;
      })
      .then((rows) => {
        if (cancelled) return;
        setParticipation(rows.find((row) => row.project.slug === scenario.slug) ?? null);
        setParticipationState("loaded");
      })
      .catch(() => {
        if (!cancelled) setParticipationState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated, getAccessToken, ready, scenario.slug]);

  function selectRelativeTab(direction: -1 | 1) {
    const currentIndex = metricTabs.findIndex((tab) => tab.id === metric);
    const nextIndex = (currentIndex + direction + metricTabs.length) % metricTabs.length;
    setMetric(metricTabs[nextIndex]!.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <main className="rwa-preview-page">
      <div className="rwa-breadcrumbs">
        <AppLink href={`/projects/${scenario.slug}`}><ArrowLeft size={15} /> Back to project</AppLink>
      </div>

      <section className="rwa-hero">
        <div>
          <p className="eyebrow">Climate RWA Pool Preview</p>
          <h1>{scenario.projectName}</h1>
          <p className="location"><MapPin size={16} /> {scenario.location}</p>
        </div>
      </section>

      <div className="rwa-layout">
        <div className="rwa-main">
          <section className="rwa-scenario-panel" aria-labelledby="rwa-scenario-heading">
            <div className="rwa-scenario-heading">
              <Info aria-hidden="true" size={18} />
              <div>
                <h2 id="rwa-scenario-heading">Illustrative scenario data</h2>
                <p>
                  Modeled preview values — not live market data or promised returns.
                  No deposits or trades are executed, and no carbon-credit ownership is granted.
                </p>
              </div>
            </div>
            <div className="rwa-metric-grid" aria-label="Illustrative pool metrics">
              <ScenarioMetric
                detail="Modeled liquidity"
                icon={<Coins size={18} />}
                label="TVL"
                value={formatCompactUsdc(scenario.illustrativeTvl)}
              />
              <ScenarioMetric
                detail="Modeled rate · no return promise"
                icon={<CircleGauge size={18} />}
                label="APY"
                value={`${scenario.illustrativeApy.toFixed(1)}%`}
              />
              <ScenarioMetric
                detail="Modeled USDC per tonne"
                icon={<Leaf size={18} />}
                label="Reference price"
                value={`${scenario.referencePrice.toFixed(2)}`}
              />
              <ScenarioMetric
                detail="Modeled tCO₂e volume"
                icon={<CircleGauge size={18} />}
                label="Projected available volume"
                value={new Intl.NumberFormat("en-US").format(scenario.availableVolume)}
              />
            </div>
          </section>

          <section className="rwa-chart-card">
            <div className="rwa-card-heading">
              <div>
                <p className="eyebrow">Scenario model</p>
                <h2>12-month scenario projection</h2>
              </div>
              <span>Not historical performance</span>
            </div>
            <div aria-label="Projection metric" className="rwa-chart-tabs" role="tablist">
              {metricTabs.map((tab, index) => (
                <button
                  aria-controls={chartPanelId}
                  aria-selected={metric === tab.id}
                  id={`${chartPanelId}-${tab.id}`}
                  key={tab.id}
                  onClick={() => setMetric(tab.id)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      selectRelativeTab(-1);
                    }
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      selectRelativeTab(1);
                    }
                  }}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  role="tab"
                  tabIndex={metric === tab.id ? 0 : -1}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              aria-labelledby={`${chartPanelId}-${metric}`}
              id={chartPanelId}
              role="tabpanel"
            >
              <ProjectionChart metric={metric} scenario={scenario} />
            </div>
          </section>

          <section className="rwa-allocation-card">
            <div className="rwa-card-heading">
              <div>
                <p className="eyebrow">Scenario allocation</p>
                <h2>Pool composition</h2>
              </div>
              <span>100% model allocation</span>
            </div>
            <div className="rwa-allocation-bar" aria-label="Scenario allocation">
              <span className="rwa-allocation-project" style={{ width: "70%" }} />
              <span className="rwa-allocation-stable" style={{ width: "25%" }} />
              <span className="rwa-allocation-incentive" style={{ width: "5%" }} />
            </div>
            <dl className="rwa-allocation-list">
              <div><dt><span className="rwa-dot rwa-dot-project" />Project-linked climate assets</dt><dd>70%</dd></div>
              <div><dt><span className="rwa-dot rwa-dot-stable" />Stable liquidity reserve</dt><dd>25%</dd></div>
              <div><dt><span className="rwa-dot rwa-dot-incentive" />EGOG incentive reserve</dt><dd>5%</dd></div>
            </dl>
          </section>

        </div>

        <aside className="rwa-participation-panel">
          <p className="eyebrow">Project preview</p>
          <h2>Choose a climate project</h2>
          <nav aria-label="RWA pool project selector" className="rwa-project-selector">
            {rwaPoolScenarios.map((option) => (
              <AppLink
                aria-current={option.slug === scenario.slug ? "page" : undefined}
                href={`/rwa-pools/${option.slug}`}
                key={option.slug}
              >
                <span>
                  <strong>{option.projectName}</strong>
                  <small>{option.proposedTokenSymbol}</small>
                </span>
                {!option.mintingEnabled ? <em>Coming Soon</em> : null}
              </AppLink>
            ))}
          </nav>

          <p className="rwa-token-note">
            Proposed preview token symbol. No token has been issued.
          </p>

          <div className="rwa-participation-state" aria-live="polite">
            {participationState === "loading" || !ready ? (
              <><span>Checking participation</span><strong>Loading…</strong></>
            ) : participationState === "error" ? (
              <><span>Participation status</span><strong>Unable to check right now</strong></>
            ) : participation ? (
              <>
                <span><CheckCircle2 size={16} /> Early Participation NFT minted</span>
                <strong>Member #{participation.participation.memberNumber}</strong>
                <small>Token ID {participation.participation.tokenId}</small>
              </>
            ) : (
              <><span>Participation status</span><strong>Early access not registered</strong></>
            )}
          </div>

          {scenario.mintingEnabled ? (
            participation ? (
              <AppLink className="primary-cta" href="/me">View My Participation <ArrowRight size={18} /></AppLink>
            ) : (
              <AppLink className="primary-cta" href={`/participate/${scenario.slug}`}>
                Mint Early Participation NFT <ArrowRight size={18} />
              </AppLink>
            )
          ) : (
            <button className="primary-cta rwa-disabled-cta" disabled type="button">
              Minting coming soon
            </button>
          )}
          <p className="rwa-action-note">Review and sign on the next step. No assets are deposited.</p>

          <div className="rwa-preview-benefits">
            <p><CheckCircle2 size={16} /> On-chain participation record</p>
            <p><CheckCircle2 size={16} /> Non-transferable participant badge</p>
            <p><CheckCircle2 size={16} /> Participation dashboard</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
