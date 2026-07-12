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

  it("keeps Solar Mobility and Jeju ERW non-participating", () => {
    for (const slug of ["solar-mobility", "jeju-erw"]) {
      const project = load(slug);
      expect(project.status).toBe("coming_soon");
      expect(project.currentVersion).toBeNull();
      expect(project.snapshots).toEqual([]);
    }
  });
});
