import { publicSnapshotSchema, type PublicSnapshot } from "./schema.js";

export function canonicalizeSnapshot(input: unknown): string {
  const snapshot = publicSnapshotSchema.parse(input);
  const canonical: PublicSnapshot = {
    projectId: snapshot.projectId,
    dataType: snapshot.dataType,
    version: snapshot.version,
    monitoringPeriod: {
      start: snapshot.monitoringPeriod.start,
      end: snapshot.monitoringPeriod.end,
    },
    monitoredReduction: {
      value: snapshot.monitoredReduction.value,
      unit: snapshot.monitoredReduction.unit,
    },
    projectProgress: snapshot.projectProgress,
    forecastCreditVolume: snapshot.forecastCreditVolume,
    targetIssuanceWindow: snapshot.targetIssuanceWindow,
    methodology: snapshot.methodology,
    registry: snapshot.registry,
    verificationStage: snapshot.verificationStage,
    verificationSourceStatus: snapshot.verificationSourceStatus,
    measuredAt: snapshot.measuredAt,
    publishedAt: snapshot.publishedAt,
    sourceName: snapshot.sourceName,
    sourceVersion: snapshot.sourceVersion,
    verificationNote: snapshot.verificationNote,
  };

  return JSON.stringify(canonical);
}
