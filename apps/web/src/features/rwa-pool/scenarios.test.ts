import { describe, expect, it } from "vitest";

import {
  getRwaPoolProjection,
  getRwaPoolScenario,
  rwaPoolScenarios,
} from "./scenarios";

describe("RWA pool illustrative scenarios", () => {
  it("maps the three project slugs in the required order", () => {
    expect(rwaPoolScenarios.map(({
      slug,
      projectName,
      proposedTokenSymbol,
      mintingEnabled,
    }) => ({
      slug,
      projectName,
      proposedTokenSymbol,
      mintingEnabled,
    }))).toEqual([
      {
        slug: "vietnam-brick",
        projectName: "Vietnam Brick Project",
        proposedTokenSymbol: "wVB-USDC",
        mintingEnabled: true,
      },
      {
        slug: "jeju-erw",
        projectName: "Jeju ERW Project",
        proposedTokenSymbol: "wJE-USDC",
        mintingEnabled: true,
      },
      {
        slug: "solar-mobility",
        projectName: "Solar Mobility Project",
        proposedTokenSymbol: "wSM-USDC",
        mintingEnabled: false,
      },
    ]);
  });

  it("keeps the approved fixed scenario values", () => {
    expect(getRwaPoolScenario("vietnam-brick")).toMatchObject({
      referencePrice: 14.8,
      illustrativeTvl: 1_480_000,
      illustrativeApy: 8.4,
      availableVolume: 100_000,
    });
    expect(getRwaPoolScenario("jeju-erw")).toMatchObject({
      referencePrice: 120,
      illustrativeTvl: 960_000,
      illustrativeApy: 10.6,
      availableVolume: 8_000,
    });
    expect(getRwaPoolScenario("solar-mobility")).toMatchObject({
      referencePrice: 11,
      illustrativeTvl: 1_760_000,
      illustrativeApy: 7.2,
      availableVolume: 160_000,
    });
    expect(getRwaPoolScenario("invalid")).toBeNull();
  });

  it("builds twelve-point projections that end at each configured value", () => {
    const scenario = getRwaPoolScenario("jeju-erw")!;

    expect(getRwaPoolProjection(scenario, "price")).toHaveLength(12);
    expect(getRwaPoolProjection(scenario, "price").at(-1)?.value).toBe(120);
    expect(getRwaPoolProjection(scenario, "apy").at(-1)?.value).toBe(10.6);
    expect(getRwaPoolProjection(scenario, "tvl").at(-1)?.value).toBe(960_000);
  });
});
