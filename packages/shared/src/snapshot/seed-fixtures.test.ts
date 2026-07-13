import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { hashSnapshot } from "./hash.js";
import { projectSeedSchema } from "./project-seed.js";

function load(slug: string) {
  return projectSeedSchema.parse(
    JSON.parse(readFileSync(resolve(`data/projects/${slug}.json`), "utf8")),
  );
}

describe("demonstration project seed fixtures", () => {
  it("keeps three unique Vietnam snapshots and v3 current", () => {
    const project = load("vietnam-brick");
    expect(project.snapshots.map((item) => item.monitoredReduction.value)).toEqual([
      "120000.000",
      "240000.000",
      "336000.000",
    ]);
    expect(project.snapshots.map((item) => item.verificationStage)).toEqual([
      "MONITORING",
      "MONITORING",
      "VALIDATION",
    ]);
    expect(new Set(project.snapshots.map(hashSnapshot))).toHaveLength(3);
    expect(project.currentVersion).toBe(3);
  });

  it("makes every numeric Vietnam snapshot inseparably demonstrational", () => {
    const project = load("vietnam-brick");
    expect(project.demonstrationNotice.toLowerCase()).toContain("demonstration");
    for (const snapshot of project.snapshots) {
      expect(snapshot.dataType).toBe("demonstration");
      expect(snapshot.sourceName).toContain("demonstration");
      expect(snapshot.verificationNote.toLowerCase()).toContain("demonstration");
      expect(snapshot.registry.toLowerCase()).toContain("demonstration");
      expect(snapshot.methodology.toLowerCase()).toContain("demonstration");
    }
  });

  it("keeps Vietnam snapshot chronology natural before the demo launch", () => {
    const project = load("vietnam-brick");
    const launchBoundary = Date.parse("2026-07-13T00:00:00.000Z");

    expect(project.snapshots.map((snapshot) => snapshot.version)).toEqual([1, 2, 3]);

    for (const [index, snapshot] of project.snapshots.entries()) {
      const measuredAt = Date.parse(snapshot.measuredAt);
      const publishedAt = Date.parse(snapshot.publishedAt);
      const monitoringEnd = Date.parse(`${snapshot.monitoringPeriod.end}T00:00:00.000Z`);
      expect(snapshot.forecastCreditVolume).not.toBeNull();
      if (snapshot.forecastCreditVolume === null) {
        throw new Error(`Vietnam Snapshot v${snapshot.version} needs a forecast date`);
      }
      const forecastAsOf = Date.parse(snapshot.forecastCreditVolume.asOf);

      expect(monitoringEnd).toBeLessThanOrEqual(measuredAt);
      expect(forecastAsOf).toBeLessThanOrEqual(publishedAt);
      expect(measuredAt).toBeLessThanOrEqual(publishedAt);
      expect(publishedAt).toBeLessThan(launchBoundary);

      if (index > 0) {
        const previous = project.snapshots[index - 1];
        if (previous === undefined) throw new Error("Previous Snapshot is missing");
        expect(Date.parse(previous.measuredAt)).toBeLessThan(measuredAt);
        expect(Date.parse(previous.publishedAt)).toBeLessThan(publishedAt);
      }
    }

    expect(project.snapshots[2]).toMatchObject({
      measuredAt: "2026-07-12T00:00:00.000Z",
      publishedAt: "2026-07-12T09:00:00.000Z",
    });
  });

  it("keeps Solar Mobility and Jeju ERW non-participating", () => {
    for (const slug of ["solar-mobility", "jeju-erw"]) {
      const project = load(slug);
      expect(project.status).toBe("coming_soon");
      expect(project.currentVersion).toBeNull();
      expect(project.snapshots).toEqual([]);
    }
  });
});
