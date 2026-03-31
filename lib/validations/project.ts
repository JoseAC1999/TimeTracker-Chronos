import { z } from "zod";

export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "El nombre del proyecto es obligatorio"),
  description: z.string().max(280, "La descripción es demasiado larga").optional().or(z.literal("")),
  color: z.string().min(4),
  icon: z.string().min(2),
  status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]),
});

export const taskSchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1, "El proyecto es obligatorio"),
  name: z.string().min(2, "El nombre de la tarea es obligatorio"),
  description: z.string().max(280, "La descripción es demasiado larga").optional().or(z.literal("")),
  status: z.enum(["TODO", "IN_PROGRESS", "BLOCKED", "DONE", "ARCHIVED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  tagIds: z.array(z.string()).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
