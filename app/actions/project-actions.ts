"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { captureError } from "@/lib/observability/capture";
import { incrementMetric } from "@/lib/observability/metrics";
import { deleteProject, restoreProject, saveProject } from "@/services/projects/project-service";
import { deleteTask, restoreTask, saveTask } from "@/services/tasks/task-service";

function normalizeList(values: FormDataEntryValue | FormDataEntryValue[] | null) {
  if (!values) return [];
  return Array.isArray(values) ? values.map(String) : [String(values)];
}

export async function upsertProjectAction(formData: FormData) {
  const user = await requireUser();
  try {
    await saveProject(user.workspaceId!, user.id, {
      id: String(formData.get("id") || "") || undefined,
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      color: String(formData.get("color") || "#0F766E"),
      icon: String(formData.get("icon") || "folder-kanban"),
      status: String(formData.get("status") || "ACTIVE") as "ACTIVE",
    });
    incrementMetric("project.upsert.success");
  } catch (error) {
    captureError(error, "project.upsert.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteProjectAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") || "");
  try {
    await deleteProject(user.workspaceId!, user.id, projectId);
    incrementMetric("project.delete.success");
  } catch (error) {
    captureError(error, "project.delete.failure", { userId: user.id, workspaceId: user.workspaceId, projectId });
    throw error;
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function restoreProjectAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") || "");
  try {
    await restoreProject(user.workspaceId!, user.id, projectId);
    incrementMetric("project.restore.success");
  } catch (error) {
    captureError(error, "project.restore.failure", { userId: user.id, workspaceId: user.workspaceId, projectId });
    throw error;
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function upsertTaskAction(formData: FormData) {
  const user = await requireUser();
  const tagValues = normalizeList(formData.getAll("tagIds"));
  try {
    await saveTask(user.workspaceId!, user.id, {
      id: String(formData.get("id") || "") || undefined,
      projectId: String(formData.get("projectId") || ""),
      name: String(formData.get("name") || ""),
      description: String(formData.get("description") || ""),
      status: String(formData.get("status") || "TODO") as "TODO",
      priority: String(formData.get("priority") || "MEDIUM") as "MEDIUM",
      tagIds: tagValues,
    });
    incrementMetric("task.upsert.success");
  } catch (error) {
    captureError(error, "task.upsert.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }

  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") || "");
  try {
    await deleteTask(user.workspaceId!, user.id, taskId);
    incrementMetric("task.delete.success");
  } catch (error) {
    captureError(error, "task.delete.failure", { userId: user.id, workspaceId: user.workspaceId, taskId });
    throw error;
  }

  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function restoreTaskAction(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId") || "");
  try {
    await restoreTask(user.workspaceId!, user.id, taskId);
    incrementMetric("task.restore.success");
  } catch (error) {
    captureError(error, "task.restore.failure", { userId: user.id, workspaceId: user.workspaceId, taskId });
    throw error;
  }

  revalidatePath("/tasks");
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}
