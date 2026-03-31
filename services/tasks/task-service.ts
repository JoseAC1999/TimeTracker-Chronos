import { logAuditEvent } from "@/lib/audit/audit-service";
import { prisma } from "@/lib/db/prisma";
import { taskSchema, type TaskInput } from "@/lib/validations/project";

async function ensureWorkspaceTags(workspaceId: string, tagIds: string[]) {
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

export async function getTasks(
  workspaceId: string,
  search?: string,
  projectId?: string,
  options?: { includeArchived?: boolean; includeDeleted?: boolean },
) {
  return prisma.task.findMany({
    where: {
      workspaceId,
      ...(options?.includeDeleted ? {} : { deletedAt: null }),
      ...(options?.includeArchived ? {} : { status: { not: "ARCHIVED" } }),
      ...(projectId ? { projectId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      project: true,
      taskTags: {
        include: {
          tag: true,
        },
      },
    },
    orderBy: [{ archivedAt: "asc" }, { updatedAt: "desc" }],
  });
}

export async function saveTask(workspaceId: string, ownerId: string, input: TaskInput) {
  const data = taskSchema.parse(input);

  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error("No se ha encontrado el proyecto dentro de este workspace.");
  }

  const tagIds = await ensureWorkspaceTags(workspaceId, data.tagIds);

  const payload = {
    workspaceId,
    ownerId,
    projectId: data.projectId,
    name: data.name,
    description: data.description || null,
    status: data.status,
    priority: data.priority,
    archivedAt: data.status === "ARCHIVED" ? new Date() : null,
  };

  if (data.id) {
    const existing = await prisma.task.findFirst({
      where: {
        id: data.id,
        workspaceId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new Error("No se encontró la tarea dentro de este workspace.");
    }

    const updated = await prisma.task.update({
      where: { id: data.id },
      data: payload,
    });

    await prisma.taskTag.deleteMany({
      where: { taskId: data.id },
    });

    if (tagIds.length) {
      await prisma.taskTag.createMany({
        data: tagIds.map((tagId) => ({
          taskId: data.id!,
          tagId,
        })),
      });
    }

    await logAuditEvent({
      workspaceId,
      userId: ownerId,
      entity: "TASK",
      entityId: updated.id,
      action: "UPDATE",
      before: {
        projectId: existing.projectId,
        name: existing.name,
        description: existing.description,
        status: existing.status,
        priority: existing.priority,
      },
      after: {
        projectId: updated.projectId,
        name: updated.name,
        description: updated.description,
        status: updated.status,
        priority: updated.priority,
      },
    });

    return prisma.task.findUnique({
      where: { id: data.id },
    });
  }

  const created = await prisma.task.create({
    data: {
      ...payload,
      taskTags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });

  await logAuditEvent({
    workspaceId,
    userId: ownerId,
    entity: "TASK",
    entityId: created.id,
    action: "CREATE",
    after: {
      projectId: created.projectId,
      name: created.name,
      description: created.description,
      status: created.status,
      priority: created.priority,
    },
  });

  return created;
}

export async function deleteTask(workspaceId: string, userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!task) {
    throw new Error("No se encontró la tarea dentro de este workspace.");
  }

  const runningEntry = await prisma.timeEntry.findFirst({
    where: {
      workspaceId,
      taskId,
      isRunning: true,
    },
  });

  if (runningEntry) {
    throw new Error("Detén el cronómetro activo antes de eliminar esta tarea.");
  }

  const deleted = await prisma.task.update({
    where: { id: task.id },
    data: {
      deletedAt: new Date(),
      archivedAt: new Date(),
      status: "ARCHIVED",
    },
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "TASK",
    entityId: deleted.id,
    action: "SOFT_DELETE",
    before: {
      name: task.name,
      status: task.status,
      projectId: task.projectId,
    },
    after: {
      status: deleted.status,
      deletedAt: deleted.deletedAt?.toISOString() ?? null,
    },
  });

  return deleted;
}

export async function restoreTask(workspaceId: string, userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      workspaceId,
      deletedAt: { not: null },
    },
  });

  if (!task) {
    throw new Error("No se encontró la tarea eliminada dentro de este workspace.");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: task.projectId,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error("No se puede restaurar la tarea porque su proyecto está eliminado.");
  }

  const restored = await prisma.task.update({
    where: { id: task.id },
    data: {
      deletedAt: null,
      ...(task.status === "ARCHIVED" ? { status: "TODO", archivedAt: null } : {}),
    },
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "TASK",
    entityId: restored.id,
    action: "RESTORE",
    before: {
      status: task.status,
      deletedAt: task.deletedAt?.toISOString() ?? null,
    },
    after: {
      status: restored.status,
      deletedAt: restored.deletedAt?.toISOString() ?? null,
    },
  });

  return restored;
}
