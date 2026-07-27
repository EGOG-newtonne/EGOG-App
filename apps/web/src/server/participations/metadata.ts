import { snapshotKind, type PublicSnapshot } from "@egog/shared";

type BadgeMetadataInput = {
  projectName: string;
  memberNumber: bigint;
  joinedAt: Date;
  snapshot: PublicSnapshot;
  snapshotUri: string;
  badgeImageUri: string;
};

export function createBadgeMetadata(input: BadgeMetadataInput) {
  return {
    name: `${input.projectName} Early Participant #${input.memberNumber}`,
    description:
      "A non-transferable EGOG participation badge. It is not an investment, financial return, or carbon credit ownership right.",
    image: input.badgeImageUri,
    external_url: input.snapshotUri,
    attributes: [
      { trait_type: "Project", value: input.projectName },
      { trait_type: "Member Number", value: Number(input.memberNumber) },
      { trait_type: "Joined At", value: input.joinedAt.toISOString() },
      { trait_type: "Snapshot Version", value: input.snapshot.version },
      {
        trait_type: "Data Type",
        value:
          snapshotKind(input.snapshot) === "field_evidence"
            ? "Field Evidence"
            : input.snapshot.dataType === "demonstration"
              ? "Demonstration"
              : "Actual",
      },
      { trait_type: "Transferability", value: "Locked" },
    ],
  } as const;
}

export function encodeJsonAsset(value: unknown, name: string, backupKey: string) {
  return {
    bytes: new TextEncoder().encode(JSON.stringify(value, null, 2)),
    name,
    contentType: "application/json",
    backupKey,
  };
}
