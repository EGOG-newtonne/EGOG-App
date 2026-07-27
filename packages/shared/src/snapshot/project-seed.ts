import { z } from "zod";

import {
  climateMetricsSnapshotSchema,
  fieldEvidenceCoreShape,
  monitoringPeriodSchema,
  utcTimestampSchema,
} from "./schema.js";

export const evidenceMediaSourceSchema = z
  .object({
    id: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    category: z.enum(["field", "sensor"]),
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(500),
    sourcePath: z.string().trim().min(1).max(500),
    contentType: z.literal("image/jpeg"),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    capturedAt: utcTimestampSchema,
    timestampBasis: z.enum(["exif", "filename"]),
    observationPeriod: monitoringPeriodSchema.nullable(),
  })
  .strict();

export const fieldEvidenceSeedSnapshotSchema = z
  .object({
    ...fieldEvidenceCoreShape,
    mediaSources: z.array(evidenceMediaSourceSchema).min(1).max(50),
  })
  .strict()
  .refine(
    ({ measuredAt, publishedAt }) => measuredAt <= publishedAt,
    "measuredAt must be on or before publishedAt",
  )
  .refine(
    ({ mediaSources }) =>
      new Set(mediaSources.map((item) => item.id)).size === mediaSources.length,
    "media source ids must be unique",
  );

export const projectSeedSnapshotSchema = z.union([
  climateMetricsSnapshotSchema,
  fieldEvidenceSeedSnapshotSchema,
]);

export const projectSeedSchema = z
  .object({
    projectId: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().min(1),
    location: z.string().min(1),
    summary: z.string().min(1),
    status: z.enum(["active", "coming_soon"]),
    heroImage: z.string().min(1),
    demonstrationNotice: z.string().min(1),
    currentVersion: z.number().int().positive().nullable(),
    snapshots: z.array(projectSeedSnapshotSchema),
  })
  .strict()
  .superRefine((project, context) => {
    const active = project.status === "active";
    if (active && project.snapshots.length === 0) {
      context.addIssue({ code: "custom", message: "active projects need snapshots" });
    }
    if (!active && (project.currentVersion !== null || project.snapshots.length > 0)) {
      context.addIssue({
        code: "custom",
        message: "coming soon projects cannot have an active snapshot",
      });
    }
    if (
      active &&
      !project.snapshots.some((snapshot) => snapshot.version === project.currentVersion)
    ) {
      context.addIssue({ code: "custom", message: "currentVersion must exist" });
    }
    if (project.snapshots.some((snapshot) => snapshot.projectId !== project.projectId)) {
      context.addIssue({
        code: "custom",
        message: "snapshot projectId must match its project",
      });
    }
    for (const snapshot of project.snapshots) {
      if (
        snapshot.snapshotKind !== "field_evidence" &&
        (snapshot.dataType !== "demonstration" ||
          !snapshot.verificationNote.toLowerCase().includes("demonstration"))
      ) {
        context.addIssue({
          code: "custom",
          message: "climate metric seed snapshots must be labeled demonstration data",
        });
      }
      if (
        snapshot.snapshotKind === "field_evidence" &&
        !snapshot.verificationNote.toLowerCase().includes("carbon")
      ) {
        context.addIssue({
          code: "custom",
          message: "field evidence must state its carbon-data limitation",
        });
      }
    }
  });

export type ProjectSeed = z.infer<typeof projectSeedSchema>;
export type FieldEvidenceSeedSnapshot = z.infer<typeof fieldEvidenceSeedSnapshotSchema>;
