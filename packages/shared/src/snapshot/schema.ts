import { z } from "zod";

const decimalStringSchema = z
  .string()
  .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "must be a non-negative decimal string");

export const utcTimestampSchema = z
  .string()
  .datetime({ offset: false, precision: 3 })
  .refine((value) => value.endsWith("Z"), "must use UTC Z notation");

const isoDateSchema = z.iso.date();

export const monitoringPeriodSchema = z
  .object({ start: isoDateSchema, end: isoDateSchema })
  .strict()
  .refine(({ start, end }) => start <= end, "start must be on or before end");

const reductionSchema = z
  .object({ value: decimalStringSchema, unit: z.literal("tCO2e") })
  .strict();

const forecastBaseSchema = {
  unit: z.literal("tCO2e"),
  asOf: utcTimestampSchema,
  basis: z.string().trim().min(1).max(500),
};

const forecastCreditVolumeSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("single"),
      value: decimalStringSchema,
      ...forecastBaseSchema,
    })
    .strict(),
  z
    .object({
      type: z.literal("range"),
      min: decimalStringSchema,
      max: decimalStringSchema,
      ...forecastBaseSchema,
    })
    .strict()
    .refine(({ min, max }) => Number(min) <= Number(max), "min must not exceed max"),
]);

export const verificationStageSchema = z.enum([
  "PLANNING",
  "MONITORING",
  "VALIDATION",
  "VERIFICATION",
  "ISSUANCE_READY",
  "ISSUED",
]);

export const climateMetricsSnapshotSchema = z
  .object({
    snapshotKind: z.literal("climate_metrics").optional(),
    projectId: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    dataType: z.enum(["demonstration", "actual"]),
    version: z.number().int().positive(),
    monitoringPeriod: monitoringPeriodSchema,
    monitoredReduction: reductionSchema,
    projectProgress: decimalStringSchema.nullable(),
    forecastCreditVolume: forecastCreditVolumeSchema.nullable(),
    targetIssuanceWindow: z.string().trim().min(1).max(100).nullable(),
    methodology: z.string().trim().min(1).max(500),
    registry: z.string().trim().min(1).max(500),
    verificationStage: verificationStageSchema,
    verificationSourceStatus: z.string().trim().min(1).max(500),
    measuredAt: utcTimestampSchema,
    publishedAt: utcTimestampSchema,
    sourceName: z.string().trim().min(1).max(200),
    sourceVersion: z.string().trim().min(1).max(200),
    verificationNote: z.string().trim().min(1).max(500),
  })
  .strict()
  .refine(
    ({ measuredAt, publishedAt }) => measuredAt <= publishedAt,
    "measuredAt must be on or before publishedAt",
  );

export const evidenceMediaSchema = z
  .object({
    id: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    category: z.enum(["field", "sensor"]),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    contentType: z.literal("image/jpeg"),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    capturedAt: utcTimestampSchema,
    timestampBasis: z.enum(["exif", "filename"]),
    observationPeriod: monitoringPeriodSchema.nullable(),
    ipfsUri: z.string().regex(/^ipfs:\/\/[A-Za-z0-9]+$/),
    gatewayUrl: z.url(),
    s3BackupKey: z.string().trim().min(1).max(500),
  })
  .strict();

export const fieldEvidenceCoreShape = {
  snapshotKind: z.literal("field_evidence"),
  projectId: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  dataType: z.literal("actual"),
  version: z.number().int().positive(),
  monitoringPeriod: monitoringPeriodSchema,
  carbonDataStatus: z.literal("pending"),
  verificationStage: z.literal("MONITORING"),
  verificationSourceStatus: z.string().trim().min(1).max(500),
  measuredAt: utcTimestampSchema,
  publishedAt: utcTimestampSchema,
  sourceName: z.string().trim().min(1).max(200),
  sourceVersion: z.string().trim().min(1).max(200),
  verificationNote: z.string().trim().min(1).max(500),
};

export const fieldEvidenceSnapshotSchema = z
  .object({
    ...fieldEvidenceCoreShape,
    media: z.array(evidenceMediaSchema).min(1).max(50),
  })
  .strict()
  .refine(
    ({ measuredAt, publishedAt }) => measuredAt <= publishedAt,
    "measuredAt must be on or before publishedAt",
  )
  .refine(
    ({ media }) => new Set(media.map((item) => item.id)).size === media.length,
    "media ids must be unique",
  );

export const publicSnapshotSchema = z.union([
  climateMetricsSnapshotSchema,
  fieldEvidenceSnapshotSchema,
]);

export type PublicSnapshot = z.infer<typeof publicSnapshotSchema>;
export type ClimateMetricsSnapshot = z.infer<typeof climateMetricsSnapshotSchema>;
export type FieldEvidenceSnapshot = z.infer<typeof fieldEvidenceSnapshotSchema>;

export function isFieldEvidenceSnapshot(
  snapshot: PublicSnapshot,
): snapshot is FieldEvidenceSnapshot {
  return snapshot.snapshotKind === "field_evidence";
}

export function snapshotKind(snapshot: PublicSnapshot) {
  return isFieldEvidenceSnapshot(snapshot)
    ? "field_evidence"
    : "climate_metrics";
}
