import { z } from "zod";

const decimalStringSchema = z
  .string()
  .regex(/^(?:0|[1-9]\d*)(?:\.\d+)?$/, "must be a non-negative decimal string");

const utcTimestampSchema = z
  .string()
  .datetime({ offset: false, precision: 3 })
  .refine((value) => value.endsWith("Z"), "must use UTC Z notation");

const isoDateSchema = z.iso.date();

const monitoringPeriodSchema = z
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

export const publicSnapshotSchema = z
  .object({
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

export type PublicSnapshot = z.infer<typeof publicSnapshotSchema>;
