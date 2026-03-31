import { differenceInSeconds, endOfMonth, endOfWeek, parseISO, startOfMonth, startOfWeek } from "date-fns";

import { logAuditEvent } from "@/lib/audit/audit-service";
import { prisma } from "@/lib/db/prisma";
import {
  manualTimeEntrySchema,
  reportFilterSchema,
  startTimerSchema,
  type ManualTimeEntryInput,
  type ReportFilterInput,
  type StartTimerInput,
} from "@/lib/validations/time-entry";
import { getTodayBounds } from "@/lib/utils/time";

async function getActiveEntry(workspaceId: string, userId: string) {
  return prisma.timeEntry.findFirst({
    where: {
      workspaceId,
      userId,
      isRunning: true,
      deletedAt: null,
    },
    include: {
      project: true,
      task: true,
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}

function computeDuration(startedAt: Date, endedAt: Date, accumulatedPauseSec = 0) {
  return Math.max(differenceInSeconds(endedAt, startedAt) - accumulatedPauseSec, 0);
}

async function ensureProjectAccess(workspaceId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error("No se ha encontrado el proyecto dentro de este workspace.");
  }

  return project;
}

async function ensureTaskAccess(workspaceId: string, taskId?: string | null, projectId?: string) {
  if (!taskId) return null;

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!task) {
    throw new Error("No se ha encontrado la tarea dentro de este workspace.");
  }

  if (projectId && task.projectId !== projectId) {
    throw new Error("La tarea seleccionada no pertenece al proyecto indicado.");
  }

  return task;
}

async function ensureTagsAccess(workspaceId: string, tagIds: string[]) {
  const uniqueTagIds = [...new Set(tagIds.filter(Boolean))];

  if (!uniqueTagIds.length) {
    return [];
  }

  const count = await prisma.tag.count({
    where: {
      workspaceId,
      id: { in: uniqueTagIds },
    },
  });

  if (count !== uniqueTagIds.length) {
    throw new Error("Una o más etiquetas no pertenecen a este workspace.");
  }

  return uniqueTagIds;
}

async function ensureOwnedEntry(workspaceId: string, userId: string, entryId: string) {
  const entry = await prisma.timeEntry.findFirst({
    where: {
      id: entryId,
      workspaceId,
      userId,
      deletedAt: null,
    },
  });

  if (!entry) {
    throw new Error("No se encontró la entrada de tiempo.");
  }

  return entry;
}

async function validateOverlap(
  workspaceId: string,
  userId: string,
  startedAt: Date,
  endedAt: Date,
  entryId?: string,
) {
  const overlap = await prisma.timeEntry.findFirst({
    where: {
      workspaceId,
      userId,
      id: entryId ? { not: entryId } : undefined,
      OR: [
        {
          deletedAt: null,
          startedAt: { lte: endedAt },
          endedAt: { gte: startedAt },
        },
        {
          deletedAt: null,
          startedAt: { lte: endedAt },
          endedAt: null,
        },
      ],
    },
  });

  if (overlap) {
    throw new Error("Esta entrada de tiempo se solapa con otra sesión.");
  }
}

export async function startTimer(workspaceId: string, userId: string, input: StartTimerInput) {
  const data = startTimerSchema.parse(input);
  await ensureProjectAccess(workspaceId, data.projectId);
  await ensureTaskAccess(workspaceId, data.taskId, data.projectId);

  const activeEntry = await getActiveEntry(workspaceId, userId);

  if (activeEntry) {
    if (data.conflictStrategy === "prompt") {
      throw new Error("Ya hay otro cronómetro en marcha.");
    }

    if (data.conflictStrategy === "pause") {
      await pauseTimer(activeEntry.id, userId);
    }

    if (data.conflictStrategy === "stop") {
      await stopTimer(activeEntry.id, userId);
    }
  }

  const created = await prisma.timeEntry.create({
    data: {
      workspaceId,
      userId,
      projectId: data.projectId,
      taskId: data.taskId || null,
      note: data.note || null,
      startedAt: new Date(),
      isRunning: true,
    },
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "TIME_ENTRY",
    entityId: created.id,
    action: "CREATE",
    after: {
      projectId: created.projectId,
      taskId: created.taskId,
      startedAt: created.startedAt.toISOString(),
      isRunning: created.isRunning,
    },
  });

  return created;
}

export async function pauseTimer(entryId: string, userId: string) {
  const entry = await prisma.timeEntry.findFirst({
    where: {
      id: entryId,
      userId,
      isRunning: true,
      pausedAt: null,
      deletedAt: null,
    },
  });

  if (!entry) {
    throw new Error("No se encontró el cronómetro o ya estaba en pausa.");
  }

  return prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      pausedAt: new Date(),
    },
  });
}

export async function resumeTimer(entryId: string, userId: string) {
  const entry = await prisma.timeEntry.findFirst({
    where: {
      id: entryId,
      userId,
      isRunning: true,
      pausedAt: { not: null },
      deletedAt: null,
    },
  });

  if (!entry?.pausedAt) {
    throw new Error("El cronómetro no está en pausa.");
  }

  const pauseSeconds = differenceInSeconds(new Date(), entry.pausedAt);
  return prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      pausedAt: null,
      accumulatedPauseSec: entry.accumulatedPauseSec + pauseSeconds,
    },
  });
}

export async function stopTimer(entryId: string, userId: string) {
  const entry = await prisma.timeEntry.findFirst({
    where: {
      id: entryId,
      userId,
      isRunning: true,
      deletedAt: null,
    },
  });

  if (!entry) {
    throw new Error("No se encontró el cronómetro.");
  }

  const now = new Date();
  const endedAt = entry.pausedAt ? entry.pausedAt : now;
  const extraPause = entry.pausedAt ? differenceInSeconds(now, entry.pausedAt) : 0;
  const accumulatedPauseSec = entry.accumulatedPauseSec + extraPause;

  return prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      isRunning: false,
      endedAt,
      pausedAt: null,
      accumulatedPauseSec,
      durationSec: computeDuration(entry.startedAt, endedAt, accumulatedPauseSec),
    },
  });
}

export async function saveManualTimeEntry(workspaceId: string, userId: string, input: ManualTimeEntryInput) {
  const data = manualTimeEntrySchema.parse(input);
  const startedAt = parseISO(data.startedAt);
  const endedAt = parseISO(data.endedAt);

  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(endedAt.getTime()) || endedAt <= startedAt) {
    throw new Error("La hora de fin debe ser posterior a la de inicio.");
  }

  await ensureProjectAccess(workspaceId, data.projectId);
  await ensureTaskAccess(workspaceId, data.taskId, data.projectId);
  const tagIds = await ensureTagsAccess(workspaceId, data.tagIds);

  if (data.id) {
    await ensureOwnedEntry(workspaceId, userId, data.id);
  }

  await validateOverlap(workspaceId, userId, startedAt, endedAt, data.id);

  const payload = {
    workspaceId,
    userId,
    projectId: data.projectId,
    taskId: data.taskId || null,
    note: data.note || null,
    startedAt,
    endedAt,
    isRunning: false,
    pausedAt: null,
    accumulatedPauseSec: 0,
    durationSec: computeDuration(startedAt, endedAt),
  };

  if (data.id) {
    const previous = await prisma.timeEntry.findFirst({
      where: {
        id: data.id,
        workspaceId,
        userId,
        deletedAt: null,
      },
    });

    const updated = await prisma.timeEntry.update({
      where: { id: data.id },
      data: payload,
    });

    await prisma.timeEntryTag.deleteMany({
      where: { timeEntryId: data.id },
    });

    if (tagIds.length) {
      await prisma.timeEntryTag.createMany({
        data: tagIds.map((tagId) => ({
          timeEntryId: data.id!,
          tagId,
        })),
      });
    }

    await logAuditEvent({
      workspaceId,
      userId,
      entity: "TIME_ENTRY",
      entityId: updated.id,
      action: "UPDATE",
      before: previous
        ? {
            projectId: previous.projectId,
            taskId: previous.taskId,
            startedAt: previous.startedAt.toISOString(),
            endedAt: previous.endedAt?.toISOString() ?? null,
            note: previous.note,
          }
        : undefined,
      after: {
        projectId: updated.projectId,
        taskId: updated.taskId,
        startedAt: updated.startedAt.toISOString(),
        endedAt: updated.endedAt?.toISOString() ?? null,
        note: updated.note,
      },
    });

    return prisma.timeEntry.findUnique({ where: { id: data.id } });
  }

  const created = await prisma.timeEntry.create({
    data: {
      ...payload,
      entryTags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "TIME_ENTRY",
    entityId: created.id,
    action: "CREATE",
    after: {
      projectId: created.projectId,
      taskId: created.taskId,
      startedAt: created.startedAt.toISOString(),
      endedAt: created.endedAt?.toISOString() ?? null,
      durationSec: created.durationSec,
    },
  });

  return created;
}

export async function deleteTimeEntry(workspaceId: string, userId: string, entryId: string) {
  const entry = await ensureOwnedEntry(workspaceId, userId, entryId);

  const deleted = await prisma.timeEntry.update({
    where: { id: entry.id },
    data: {
      deletedAt: new Date(),
      isRunning: false,
      pausedAt: null,
    },
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "TIME_ENTRY",
    entityId: deleted.id,
    action: "SOFT_DELETE",
    before: {
      projectId: entry.projectId,
      taskId: entry.taskId,
      startedAt: entry.startedAt.toISOString(),
      endedAt: entry.endedAt?.toISOString() ?? null,
    },
    after: {
      deletedAt: deleted.deletedAt?.toISOString() ?? null,
    },
  });

  return deleted;
}

export async function restoreTimeEntry(workspaceId: string, userId: string, entryId: string) {
  const entry = await prisma.timeEntry.findFirst({
    where: {
      id: entryId,
      workspaceId,
      userId,
      deletedAt: { not: null },
    },
  });

  if (!entry) {
    throw new Error("No se encontró la sesión eliminada.");
  }

  await ensureProjectAccess(workspaceId, entry.projectId);
  await ensureTaskAccess(workspaceId, entry.taskId, entry.projectId);

  const restored = await prisma.timeEntry.update({
    where: { id: entry.id },
    data: {
      deletedAt: null,
    },
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "TIME_ENTRY",
    entityId: restored.id,
    action: "RESTORE",
    before: {
      deletedAt: entry.deletedAt?.toISOString() ?? null,
    },
    after: {
      deletedAt: restored.deletedAt?.toISOString() ?? null,
    },
  });

  return restored;
}

export async function getTimerPageData(workspaceId: string, userId: string) {
  const [activeEntry, projects, tasks] = await Promise.all([
    getActiveEntry(workspaceId, userId),
    prisma.project.findMany({
      where: { workspaceId, status: { not: "ARCHIVED" }, deletedAt: null },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.task.findMany({
      where: { workspaceId, status: { not: "ARCHIVED" }, deletedAt: null },
      include: { project: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return { activeEntry, projects, tasks };
}

export async function getSessions(
  workspaceId: string,
  userId: string,
  filters?: Partial<ReportFilterInput>,
  options?: { includeDeleted?: boolean },
) {
  const parsed = reportFilterSchema.partial().parse(filters ?? {});
  const now = new Date();
  const todayBounds = getTodayBounds(now);
  const rangeStart =
    parsed.range === "month"
      ? startOfMonth(now)
      : parsed.range === "week"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : todayBounds.start;
  const rangeEnd =
    parsed.range === "month"
      ? endOfMonth(now)
      : parsed.range === "week"
        ? endOfWeek(now, { weekStartsOn: 1 })
        : todayBounds.end;

  return prisma.timeEntry.findMany({
    where: {
      workspaceId,
      userId,
      ...(options?.includeDeleted ? {} : { deletedAt: null }),
      startedAt: {
        gte: rangeStart,
        lte: rangeEnd,
      },
      ...(parsed.projectId ? { projectId: parsed.projectId } : {}),
      ...(parsed.taskId ? { taskId: parsed.taskId } : {}),
      ...(parsed.tagId ? { entryTags: { some: { tagId: parsed.tagId } } } : {}),
    },
    include: {
      project: true,
      task: true,
      entryTags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: {
      startedAt: "desc",
    },
  });
}
