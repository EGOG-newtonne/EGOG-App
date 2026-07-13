import { describe, expect, it } from "vitest";

import {
  canonicalizeSnapshot,
  hashSnapshot,
  publicSnapshotSchema,
} from "./index.js";

const fixture = {
  projectId: "vietnam-brick-001",
  dataType: "demonstration",
  version: 3,
  monitoringPeriod: { start: "2026-05-01", end: "2026-07-12" },
  monitoredReduction: { value: "336000.000", unit: "tCO2e" },
  projectProgress: "42.0",
  forecastCreditVolume: {
    type: "range",
    min: "750000.000",
    max: "800000.000",
    unit: "tCO2e",
    asOf: "2026-07-12T00:00:00.000Z",
    basis: "Demonstration assumptions based on sample monitoring data",
  },
  targetIssuanceWindow: "2027-Q2..Q3",
  methodology: "AMS-III.Z Energy Efficiency and Fuel Switching Measures for Brick Production",
  registry: "Verra VCS (demonstration candidate; registration not confirmed)",
  verificationStage: "VALIDATION",
  verificationSourceStatus: "Demonstration validation preparation",
  measuredAt: "2026-07-12T00:00:00.000Z",
  publishedAt: "2026-07-12T09:00:00.000Z",
  sourceName: "EGOG demonstration seed",
  sourceVersion: "vietnam-brick-seed-v3",
  verificationNote: "Demonstration data; not verified or issued carbon credits.",
} as const;

describe("public dMRV snapshot", () => {
  it("produces the same canonical JSON and hash regardless of input key order", () => {
    const reordered = Object.fromEntries(
      Object.entries(fixture).reverse(),
    );

    expect(canonicalizeSnapshot(reordered)).toBe(canonicalizeSnapshot(fixture));
    expect(hashSnapshot(reordered)).toBe(hashSnapshot(fixture));
    expect(hashSnapshot(fixture)).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("changes the hash when a meaningful field changes", () => {
    expect(
      hashSnapshot({
        ...fixture,
        monitoredReduction: { value: "336001.000", unit: "tCO2e" },
      }),
    ).not.toBe(hashSnapshot(fixture));
  });

  it("rejects floats, non-standard units, non-UTC timestamps, and UI-only fields", () => {
    expect(() =>
      publicSnapshotSchema.parse({
        ...fixture,
        monitoredReduction: { value: 336000, unit: "tCO2e" },
      }),
    ).toThrow();
    expect(() =>
      publicSnapshotSchema.parse({
        ...fixture,
        monitoredReduction: { value: "336000.000", unit: "ktCO2e" },
      }),
    ).toThrow();
    expect(() =>
      publicSnapshotSchema.parse({ ...fixture, measuredAt: "2026-07-20" }),
    ).toThrow();
    expect(() =>
      publicSnapshotSchema.parse({ ...fixture, heroImage: "https://example.com/a.jpg" }),
    ).toThrow();
  });

  it("preserves explicit null progress", () => {
    const parsed = publicSnapshotSchema.parse({ ...fixture, projectProgress: null });
    expect(JSON.parse(canonicalizeSnapshot(parsed)).projectProgress).toBeNull();
  });
});
