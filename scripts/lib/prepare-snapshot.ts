import {
  canonicalizeSnapshot,
  hashSnapshot,
  type PublicSnapshot,
} from "../../packages/shared/src/index.js";

export function prepareSnapshotPublication(snapshot: PublicSnapshot) {
  const canonicalJson = canonicalizeSnapshot(snapshot);
  const snapshotHash = hashSnapshot(snapshot);
  const version = `v${snapshot.version}`;
  return {
    canonicalJson,
    snapshotHash,
    bytes: new TextEncoder().encode(canonicalJson),
    name: `${snapshot.projectId}-${version}.json`,
    contentType: "application/json",
    backupKey: `public-snapshots/${snapshot.projectId}/${version}/${snapshotHash}.json`,
  };
}
