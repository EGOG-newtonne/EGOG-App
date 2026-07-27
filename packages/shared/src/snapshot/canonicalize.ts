import {
  publicSnapshotSchema,
  snapshotKind,
  type ClimateMetricsSnapshot,
  type FieldEvidenceSnapshot,
} from "./schema.js";

export function canonicalizeSnapshot(input: unknown): string {
  const snapshot = publicSnapshotSchema.parse(input);
  if (snapshotKind(snapshot) === "field_evidence") {
    const evidence = snapshot as FieldEvidenceSnapshot;
    const canonical: FieldEvidenceSnapshot = {
      snapshotKind: "field_evidence",
      projectId: evidence.projectId,
      dataType: evidence.dataType,
      version: evidence.version,
      monitoringPeriod: {
        start: evidence.monitoringPeriod.start,
        end: evidence.monitoringPeriod.end,
      },
      carbonDataStatus: evidence.carbonDataStatus,
      verificationStage: evidence.verificationStage,
      verificationSourceStatus: evidence.verificationSourceStatus,
      measuredAt: evidence.measuredAt,
      publishedAt: evidence.publishedAt,
      sourceName: evidence.sourceName,
      sourceVersion: evidence.sourceVersion,
      verificationNote: evidence.verificationNote,
      media: evidence.media.map((item) => ({
        id: item.id,
        category: item.category,
        title: item.title,
        description: item.description,
        contentType: item.contentType,
        sha256: item.sha256,
        capturedAt: item.capturedAt,
        timestampBasis: item.timestampBasis,
        observationPeriod: item.observationPeriod
          ? {
              start: item.observationPeriod.start,
              end: item.observationPeriod.end,
            }
          : null,
        ipfsUri: item.ipfsUri,
        gatewayUrl: item.gatewayUrl,
        s3BackupKey: item.s3BackupKey,
      })),
    };
    return JSON.stringify(canonical);
  }

  const climate = snapshot as ClimateMetricsSnapshot;
  // snapshotKind is intentionally omitted here. Existing climate Snapshot
  // canonical JSON and hashes must remain byte-for-byte stable.
  const canonical = {
    projectId: climate.projectId,
    dataType: climate.dataType,
    version: climate.version,
    monitoringPeriod: {
      start: climate.monitoringPeriod.start,
      end: climate.monitoringPeriod.end,
    },
    monitoredReduction: {
      value: climate.monitoredReduction.value,
      unit: climate.monitoredReduction.unit,
    },
    projectProgress: climate.projectProgress,
    forecastCreditVolume: climate.forecastCreditVolume,
    targetIssuanceWindow: climate.targetIssuanceWindow,
    methodology: climate.methodology,
    registry: climate.registry,
    verificationStage: climate.verificationStage,
    verificationSourceStatus: climate.verificationSourceStatus,
    measuredAt: climate.measuredAt,
    publishedAt: climate.publishedAt,
    sourceName: climate.sourceName,
    sourceVersion: climate.sourceVersion,
    verificationNote: climate.verificationNote,
  };

  return JSON.stringify(canonical);
}
