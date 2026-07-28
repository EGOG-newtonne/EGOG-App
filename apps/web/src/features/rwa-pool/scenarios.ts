export type RwaPoolMetric = "price" | "apy" | "tvl";

export type RwaPoolScenario = {
  slug: "vietnam-brick" | "jeju-erw" | "solar-mobility";
  projectName: string;
  proposedTokenSymbol: "wVB-USDC" | "wJE-USDC" | "wSM-USDC";
  location: string;
  mintingEnabled: boolean;
  referencePrice: number;
  illustrativeTvl: number;
  illustrativeApy: number;
  availableVolume: number;
};

const multipliers: Record<RwaPoolMetric, readonly number[]> = {
  price: [0.82, 0.84, 0.87, 0.86, 0.89, 0.91, 0.93, 0.92, 0.95, 0.94, 0.97, 1],
  apy: [0.8, 0.82, 0.85, 0.84, 0.88, 0.9, 0.93, 0.92, 0.95, 0.97, 0.99, 1],
  tvl: [0.55, 0.58, 0.62, 0.65, 0.69, 0.73, 0.77, 0.81, 0.85, 0.9, 0.95, 1],
};

export const rwaPoolScenarios: readonly RwaPoolScenario[] = [
  {
    slug: "vietnam-brick",
    projectName: "Vietnam Brick Project",
    proposedTokenSymbol: "wVB-USDC",
    location: "Vietnam",
    mintingEnabled: true,
    referencePrice: 14.8,
    illustrativeTvl: 1_480_000,
    illustrativeApy: 8.4,
    availableVolume: 100_000,
  },
  {
    slug: "jeju-erw",
    projectName: "Jeju ERW Project",
    proposedTokenSymbol: "wJE-USDC",
    location: "Jeju, South Korea",
    mintingEnabled: true,
    referencePrice: 120,
    illustrativeTvl: 960_000,
    illustrativeApy: 10.6,
    availableVolume: 8_000,
  },
  {
    slug: "solar-mobility",
    projectName: "Solar Mobility Project",
    proposedTokenSymbol: "wSM-USDC",
    location: "South Korea",
    mintingEnabled: false,
    referencePrice: 11,
    illustrativeTvl: 1_760_000,
    illustrativeApy: 7.2,
    availableVolume: 160_000,
  },
];

export function getRwaPoolScenario(slug: string) {
  return rwaPoolScenarios.find((scenario) => scenario.slug === slug) ?? null;
}

export function getRwaPoolProjection(
  scenario: RwaPoolScenario,
  metric: RwaPoolMetric,
) {
  const finalValue = metric === "price"
    ? scenario.referencePrice
    : metric === "apy"
      ? scenario.illustrativeApy
      : scenario.illustrativeTvl;

  return multipliers[metric].map((multiplier, index) => ({
    month: index + 1,
    value: Number((finalValue * multiplier).toFixed(metric === "tvl" ? 0 : 2)),
  }));
}
