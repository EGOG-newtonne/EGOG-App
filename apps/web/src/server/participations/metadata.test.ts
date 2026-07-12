import { describe, expect, it } from "vitest";

import seed from "../../../../../data/projects/vietnam-brick.json";
import { publicSnapshotSchema } from "@egog/shared";

import { createBadgeMetadata, encodeJsonAsset } from "./metadata";

describe("badge metadata", () => {
  const snapshot = publicSnapshotSchema.parse(seed.snapshots[2]);

  it("creates immutable user-specific metadata with the common IPFS image", () => {
    const metadata = createBadgeMetadata({
      projectName: "Vietnam Brick Project",
      memberNumber: 24n,
      joinedAt: new Date("2026-07-20T10:00:00.000Z"),
      snapshot,
      snapshotUri: "ipfs://snapshot",
      badgeImageUri: "ipfs://badge-image",
    });

    expect(metadata.name).toContain("#24");
    expect(metadata.image).toBe("ipfs://badge-image");
    expect(metadata.attributes).toContainEqual({ trait_type: "Data Type", value: "Demonstration" });
  });

  it("encodes deterministic JSON bytes for Pinata and S3", () => {
    const asset = encodeJsonAsset({ name: "EGOG" }, "metadata.json", "badges/1.json");
    expect(new TextDecoder().decode(asset.bytes)).toBe('{\n  "name": "EGOG"\n}');
  });
});
