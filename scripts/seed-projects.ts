import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  fieldEvidenceSnapshotSchema,
  type FieldEvidenceSeedSnapshot,
  type PublicSnapshot,
} from "../packages/shared/src/index.js";
import { projectSeedSchema } from "../packages/shared/src/index.js";
import { prepareSnapshotPublication } from "./lib/prepare-snapshot.js";

async function main() {
const environmentArgument = process.argv.find((argument) => argument.startsWith("--env="));
const environmentValue = environmentArgument?.split("=")[1] ??
  (process.argv.includes("demo") ? "demo" : "dev");
if (environmentValue !== "dev" && environmentValue !== "demo") {
  throw new Error("--env must be dev or demo");
}
const environment = environmentValue;
const envFileFlag = process.argv.find((argument) => argument.startsWith("--env-file="));
const envFile = envFileFlag?.split("=")[1] ?? "apps/web/.env.local";
process.loadEnvFile(resolve(envFile));

if (process.env.NEXT_PUBLIC_APP_ENV !== (environment === "demo" ? "demo" : "development")) {
  throw new Error(`Environment mismatch: expected ${environment}`);
}

const [{ and, eq }, database, schema, storage, pinata, s3, serverEnv, clientEnv] =
  await Promise.all([
    import("drizzle-orm"),
    import("../apps/web/src/server/db/factory.js"),
    import("../apps/web/src/server/db/schema.js"),
    import("../apps/web/src/server/storage/public-assets.js"),
    import("../apps/web/src/server/storage/pinata.js"),
    import("../apps/web/src/server/storage/s3.js"),
    import("../apps/web/src/env/env.server.schema.js"),
    import("../apps/web/src/env/env.client.schema.js"),
  ]);

const serverEnvironment = serverEnv.parseServerEnvironment(process.env);
const clientEnvironment = clientEnv.parseClientEnvironment(process.env);
const { db, sql } = database.createDatabase(serverEnvironment.DATABASE_URL);
const uploadPublic = pinata.createPinataUploader(serverEnvironment.PINATA_JWT);
const putBackup = s3.createS3BackupWriter({
  bucket: serverEnvironment.AWS_S3_BUCKET,
  region: serverEnvironment.AWS_REGION,
  accessKeyId: serverEnvironment.AWS_ACCESS_KEY_ID,
  secretAccessKey: serverEnvironment.AWS_SECRET_ACCESS_KEY,
});

const badgeImageBytes = new Uint8Array(
  readFileSync(resolve("apps/web/public/images/participation-badge.svg")),
);
const badgeImage = await storage.publishPublicAsset(
  {
    bytes: badgeImageBytes,
    name: "egog-participation-badge.svg",
    contentType: "image/svg+xml",
    backupKey: "badges/common/egog-participation-badge.svg",
  },
  { uploadPublic, putBackup, gatewayBaseUrl: clientEnvironment.NEXT_PUBLIC_PINATA_GATEWAY_URL },
);

async function publishFieldEvidenceSnapshot(
  snapshot: FieldEvidenceSeedSnapshot,
): Promise<PublicSnapshot> {
  const media = [];
  for (const source of snapshot.mediaSources) {
    const bytes = new Uint8Array(readFileSync(resolve(source.sourcePath)));
    const actualSha256 = createHash("sha256").update(bytes).digest("hex");
    if (actualSha256 !== source.sha256) {
      throw new Error(
        `Evidence hash mismatch for ${source.id}: expected ${source.sha256}, received ${actualSha256}`,
      );
    }
    const backupKey =
      `field-evidence/${snapshot.projectId}/v${snapshot.version}/${source.sha256}/${source.id}.jpg`;
    const published = await storage.publishPublicAsset(
      {
        bytes,
        name: `${source.id}.jpg`,
        contentType: source.contentType,
        backupKey,
      },
      {
        uploadPublic,
        putBackup,
        gatewayBaseUrl: clientEnvironment.NEXT_PUBLIC_PINATA_GATEWAY_URL,
      },
    );
    media.push({
      id: source.id,
      category: source.category,
      title: source.title,
      description: source.description,
      contentType: source.contentType,
      sha256: source.sha256,
      capturedAt: source.capturedAt,
      timestampBasis: source.timestampBasis,
      observationPeriod: source.observationPeriod,
      ipfsUri: published.ipfsUri,
      gatewayUrl: published.gatewayUrl,
      s3BackupKey: published.backupKey,
    });
  }

  return fieldEvidenceSnapshotSchema.parse({
    snapshotKind: snapshot.snapshotKind,
    projectId: snapshot.projectId,
    dataType: snapshot.dataType,
    version: snapshot.version,
    monitoringPeriod: snapshot.monitoringPeriod,
    carbonDataStatus: snapshot.carbonDataStatus,
    verificationStage: snapshot.verificationStage,
    verificationSourceStatus: snapshot.verificationSourceStatus,
    measuredAt: snapshot.measuredAt,
    publishedAt: snapshot.publishedAt,
    sourceName: snapshot.sourceName,
    sourceVersion: snapshot.sourceVersion,
    verificationNote: snapshot.verificationNote,
    media,
  });
}

for (const slug of ["vietnam-brick", "solar-mobility", "jeju-erw"]) {
  const seed = projectSeedSchema.parse(
    JSON.parse(readFileSync(resolve(`data/projects/${slug}.json`), "utf8")),
  );

  await db
    .insert(schema.projects)
    .values({
      id: seed.projectId,
      slug: seed.slug,
      name: seed.name,
      location: seed.location,
      summary: seed.summary,
      heroImage: seed.heroImage,
      status: seed.status,
      demonstrationNotice: seed.demonstrationNotice,
      badgeImageUri: badgeImage.ipfsUri,
    })
    .onConflictDoUpdate({
      target: schema.projects.id,
      set: {
        name: seed.name,
        location: seed.location,
        summary: seed.summary,
        heroImage: seed.heroImage,
        status: seed.status,
        demonstrationNotice: seed.demonstrationNotice,
        badgeImageUri: badgeImage.ipfsUri,
        updatedAt: new Date(),
      },
    });

  let currentSnapshotId: string | null = null;
  for (const seedSnapshot of seed.snapshots) {
    const snapshot =
      seedSnapshot.snapshotKind === "field_evidence"
        ? await publishFieldEvidenceSnapshot(seedSnapshot)
        : seedSnapshot;
    const prepared = prepareSnapshotPublication(snapshot);
    const [existing] = await db
      .select({ id: schema.projectSnapshots.id, hash: schema.projectSnapshots.snapshotHash })
      .from(schema.projectSnapshots)
      .where(
        and(
          eq(schema.projectSnapshots.projectId, seed.projectId),
          eq(schema.projectSnapshots.version, snapshot.version),
        ),
      )
      .limit(1);

    if (existing) {
      if (existing.hash !== prepared.snapshotHash) {
        throw new Error(`Immutable snapshot conflict for ${seed.slug} v${snapshot.version}`);
      }
      if (snapshot.version === seed.currentVersion) currentSnapshotId = existing.id;
      continue;
    }

    const published = await storage.publishPublicAsset(prepared, {
      uploadPublic,
      putBackup,
      gatewayBaseUrl: clientEnvironment.NEXT_PUBLIC_PINATA_GATEWAY_URL,
    });
    const [inserted] = await db
      .insert(schema.projectSnapshots)
      .values({
        projectId: seed.projectId,
        version: snapshot.version,
        dataType: snapshot.dataType,
        verificationStage: snapshot.verificationStage,
        publicData: snapshot,
        canonicalJson: prepared.canonicalJson,
        snapshotHash: prepared.snapshotHash,
        snapshotUri: published.ipfsUri,
        gatewayUrl: published.gatewayUrl,
        s3BackupKey: published.backupKey,
        measuredAt: new Date(snapshot.measuredAt),
        publishedAt: new Date(snapshot.publishedAt),
      })
      .returning({ id: schema.projectSnapshots.id });
    if (!inserted) throw new Error(`Snapshot insert failed for ${seed.slug}`);
    if (snapshot.version === seed.currentVersion) currentSnapshotId = inserted.id;
  }

  await db
    .update(schema.projects)
    .set({ currentSnapshotId, updatedAt: new Date() })
    .where(eq(schema.projects.id, seed.projectId));
  console.log(`Seeded ${seed.slug}: ${seed.snapshots.length} snapshot(s)`);
}

console.log(`EGOG ${environment} project seed complete`);
await sql.end();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unknown seed failure");
  process.exitCode = 1;
});
