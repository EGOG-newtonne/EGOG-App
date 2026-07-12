import { readFileSync } from "node:fs";

import { projectSeedSchema } from "../../packages/shared/src/index.js";
import { describe, expect, it } from "vitest";

import { prepareSnapshotPublication } from "./prepare-snapshot";

describe("prepareSnapshotPublication", () => {
  it("creates deterministic public and backup references without UI fields", () => {
    const seed = projectSeedSchema.parse(
      JSON.parse(readFileSync("data/projects/vietnam-brick.json", "utf8")),
    );
    const publication = prepareSnapshotPublication(seed.snapshots[2]);
    expect(publication.name).toBe("vietnam-brick-001-v3.json");
    expect(publication.backupKey).toMatch(
      /^public-snapshots\/vietnam-brick-001\/v3\/0x[0-9a-f]{64}\.json$/,
    );
    expect(JSON.parse(publication.canonicalJson)).not.toHaveProperty("heroImage");
    expect(new TextDecoder().decode(publication.bytes)).toBe(
      publication.canonicalJson,
    );
  });
});
