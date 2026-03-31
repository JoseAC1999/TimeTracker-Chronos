import { z } from "zod";

export const startTimerSchema = z.object({
  projectId: z.string().min(1, "El proyecto es obligatorio"),
  taskId: z.string().optional().nullable(),
  note: z.string().max(280, "La nota es demasiado larga").optional().or(z.literal("")),
  conflictStrategy: z.enum(["prompt", "pause", "stop"]).default("prompt"),
});

export const updateTimerSchema = z.object({
  entryId: z.string().min(1),
});

export const manualTimeEntrySchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1, "El proyecto es obligatorio"),
  taskId: z.string().optional().nullable(),
  note: z.string().max(280, "La nota es demasiado larga").optional().or(z.literal("")),
  startedAt: z.string().min(1, "La hora de inicio es obligatoria"),
  endedAt: z.string().min(1, "La hora de fin es obligatoria"),
  tagIds: z.array(z.string()).default([]),
});

export const reportFilterSchema = z.object({
  range: z.enum(["day", "week", "month"]).default("week"),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  tagId: z.string().optional(),
});

export type StartTimerInput = z.infer<typeof startTimerSchema>;
export type ManualTimeEntryInput = z.infer<typeof manualTimeEntrySchema>;
export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
