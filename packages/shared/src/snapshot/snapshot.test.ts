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
    expect(JSON.parse(canonicalizeSnapshot(parsed)) as unknown).toHaveProperty(
      "projectProgress",
      null,
    );
  });

  it("accepts field evidence without carbon metrics and hashes the media manifest", () => {
    const evidence = {
      snapshotKind: "field_evidence",
      projectId: "jeju-erw-001",
      dataType: "actual",
      version: 1,
      monitoringPeriod: { start: "2026-07-07", end: "2026-07-27" },
      carbonDataStatus: "pending",
      verificationStage: "MONITORING",
      verificationSourceStatus: "Field evidence published; carbon data pending.",
      measuredAt: "2026-07-27T01:20:02.000Z",
      publishedAt: "2026-07-27T01:30:00.000Z",
      sourceName: "Newtonne Jeju field evidence",
      sourceVersion: "jeju-erw-field-evidence-2026-07-27",
      verificationNote:
        "Actual field evidence; this does not verify carbon removal or carbon credits.",
      media: [
        {
          id: "jeju-field-site",
          category: "field",
          title: "Jeju field monitoring site",
          description: "Wide view of the monitored field.",
          contentType: "image/jpeg",
          sha256: "e3612a966681d7f6fa212417320938ec93e6746c89cb8244f186c166258888c8",
          capturedAt: "2026-07-27T01:19:41.000Z",
          timestampBasis: "exif",
          observationPeriod: null,
          ipfsUri: "ipfs://bafyevidence",
          gatewayUrl: "https://gateway.example/ipfs/bafyevidence",
          s3BackupKey: "field-evidence/jeju/v1/evidence.jpg",
        },
      ],
    } as const;

    const parsed = publicSnapshotSchema.parse(evidence);
    expect(parsed.snapshotKind).toBe("field_evidence");
    expect(parsed).not.toHaveProperty("monitoredReduction");
    expect(hashSnapshot(parsed)).toMatch(/^0x[0-9a-f]{64}$/);
    expect(
      hashSnapshot({
        ...evidence,
        media: [{ ...evidence.media[0], sha256: "a".repeat(64) }],
      }),
    ).not.toBe(hashSnapshot(evidence));
  });

  it("rejects field evidence with an unpinned media URI", () => {
    expect(() =>
      publicSnapshotSchema.parse({
        snapshotKind: "field_evidence",
        projectId: "jeju-erw-001",
        dataType: "actual",
        version: 1,
        monitoringPeriod: { start: "2026-07-07", end: "2026-07-27" },
        carbonDataStatus: "pending",
        verificationStage: "MONITORING",
        verificationSourceStatus: "Field evidence published; carbon data pending.",
        measuredAt: "2026-07-27T01:20:02.000Z",
        publishedAt: "2026-07-27T01:30:00.000Z",
        sourceName: "Newtonne Jeju field evidence",
        sourceVersion: "jeju-erw-field-evidence-2026-07-27",
        verificationNote: "Does not verify carbon removal.",
        media: [
          {
            id: "jeju-field-site",
            category: "field",
            title: "Jeju field monitoring site",
            description: "Wide view of the monitored field.",
            contentType: "image/jpeg",
            sha256: "e".repeat(64),
            capturedAt: "2026-07-27T01:19:41.000Z",
            timestampBasis: "exif",
            observationPeriod: null,
            ipfsUri: "/images/jeju-field-site.jpg",
            gatewayUrl: "https://gateway.example/evidence",
            s3BackupKey: "field-evidence/jeju/v1/evidence.jpg",
          },
        ],
      }),
    ).toThrow();
  });
});
