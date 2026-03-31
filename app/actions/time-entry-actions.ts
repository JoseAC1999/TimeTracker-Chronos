"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth/session";
import { captureError } from "@/lib/observability/capture";
import { logger } from "@/lib/observability/logger";
import { incrementMetric } from "@/lib/observability/metrics";
import {
  deleteTimeEntry,
  pauseTimer,
  restoreTimeEntry,
  resumeTimer,
  saveManualTimeEntry,
  startTimer,
  stopTimer,
} from "@/services/time-entries/time-entry-service";

const revalidateTimerPaths = () => {
  revalidatePath("/dashboard");
  revalidatePath("/timer");
  revalidatePath("/sessions");
  revalidatePath("/reports");
  revalidatePath("/projects");
  revalidatePath("/tasks");
};

export async function startTimerAction(formData: FormData) {
  const user = await requireUser();
  try {
    await startTimer(user.workspaceId!, user.id, {
      projectId: String(formData.get("projectId") || ""),
      taskId: String(formData.get("taskId") || "") || null,
      note: String(formData.get("note") || ""),
      conflictStrategy: (String(formData.get("conflictStrategy") || "prompt") as "prompt" | "pause" | "stop"),
    });
    incrementMetric("timer.start.success");
    logger.info({
      event: "timer.start.success",
      message: "Timer started",
      context: { userId: user.id, workspaceId: user.workspaceId },
    });
  } catch (error) {
    captureError(error, "timer.start.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }

  revalidateTimerPaths();
}

export async function pauseTimerAction(formData: FormData) {
  const user = await requireUser();
  try {
    await pauseTimer(String(formData.get("entryId") || ""), user.id);
    incrementMetric("timer.pause.success");
  } catch (error) {
    captureError(error, "timer.pause.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }
  revalidateTimerPaths();
}

export async function resumeTimerAction(formData: FormData) {
  const user = await requireUser();
  try {
    await resumeTimer(String(formData.get("entryId") || ""), user.id);
    incrementMetric("timer.resume.success");
  } catch (error) {
    captureError(error, "timer.resume.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }
  revalidateTimerPaths();
}

export async function stopTimerAction(formData: FormData) {
  const user = await requireUser();
  try {
    await stopTimer(String(formData.get("entryId") || ""), user.id);
    incrementMetric("timer.stop.success");
  } catch (error) {
    captureError(error, "timer.stop.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }
  revalidateTimerPaths();
}

export async function saveManualEntryAction(formData: FormData) {
  const user = await requireUser();
  try {
    await saveManualTimeEntry(user.workspaceId!, user.id, {
      id: String(formData.get("id") || "") || undefined,
      projectId: String(formData.get("projectId") || ""),
      taskId: String(formData.get("taskId") || "") || null,
      note: String(formData.get("note") || ""),
      startedAt: String(formData.get("startedAt") || ""),
      endedAt: String(formData.get("endedAt") || ""),
      tagIds: formData.getAll("tagIds").map(String),
    });
    incrementMetric("timer.manual_entry.success");
  } catch (error) {
    captureError(error, "timer.manual_entry.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }

  revalidateTimerPaths();
}

export async function deleteTimeEntryAction(formData: FormData) {
  const user = await requireUser();
  try {
    await deleteTimeEntry(user.workspaceId!, user.id, String(formData.get("entryId") || ""));
    incrementMetric("timer.delete_entry.success");
  } catch (error) {
    captureError(error, "timer.delete_entry.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }
  revalidateTimerPaths();
}

export async function restoreTimeEntryAction(formData: FormData) {
  const user = await requireUser();
  try {
    await restoreTimeEntry(user.workspaceId!, user.id, String(formData.get("entryId") || ""));
    incrementMetric("timer.restore_entry.success");
  } catch (error) {
    captureError(error, "timer.restore_entry.failure", { userId: user.id, workspaceId: user.workspaceId });
    throw error;
  }
  revalidateTimerPaths();
}
