import { z } from "zod";

import { publicSnapshotSchema } from "./schema.js";

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
    snapshots: z.array(publicSnapshotSchema),
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
    if (
      project.snapshots.some(
        (snapshot) =>
          snapshot.projectId !== project.projectId ||
          snapshot.dataType !== "demonstration" ||
          !snapshot.verificationNote.toLowerCase().includes("demonstration"),
      )
    ) {
      context.addIssue({
        code: "custom",
        message: "MVP seed snapshots must be inseparably labeled demonstration data",
      });
    }
  });

export type ProjectSeed = z.infer<typeof projectSeedSchema>;
