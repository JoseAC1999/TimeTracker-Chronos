import type { Prisma } from "@prisma/client";

import { logAuditEvent } from "@/lib/audit/audit-service";
import { prisma } from "@/lib/db/prisma";
import { projectSchema, type ProjectInput } from "@/lib/validations/project";

export async function getProjects(workspaceId: string, search?: string, options?: { includeArchived?: boolean; includeDeleted?: boolean }) {
  return prisma.project.findMany({
    where: {
      workspaceId,
      ...(options?.includeDeleted ? {} : { deletedAt: null }),
      ...(options?.includeArchived ? {} : { status: { not: "ARCHIVED" } }),
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
      _count: {
        select: {
          tasks: true,
          timeEntries: true,
        },
      },
    },
    orderBy: [{ archivedAt: "asc" }, { updatedAt: "desc" }],
  });
}

export async function getProjectById(workspaceId: string, projectId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
      deletedAt: null,
    },
    include: {
      tasks: {
        where: { deletedAt: null },
        include: {
          taskTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
      timeEntries: {
        take: 8,
        where: {
          deletedAt: null,
        },
        include: {
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
      },
    },
  });
}

export async function saveProject(workspaceId: string, ownerId: string, input: ProjectInput) {
  const data = projectSchema.parse(input);
  const createPayload: Prisma.ProjectUncheckedCreateInput = {
    workspaceId,
    ownerId,
    name: data.name,
    description: data.description || null,
    color: data.color,
    icon: data.icon,
    status: data.status,
    archivedAt: data.status === "ARCHIVED" ? new Date() : null,
  };

  if (data.id) {
    const existing = await prisma.project.findFirst({
      where: {
        id: data.id,
        workspaceId,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new Error("No se encontró el proyecto dentro de este workspace.");
    }

    const updated = await prisma.project.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color,
        icon: data.icon,
        status: data.status,
        archivedAt: data.status === "ARCHIVED" ? new Date() : null,
      },
    });

    await logAuditEvent({
      workspaceId,
      userId: ownerId,
      entity: "PROJECT",
      entityId: updated.id,
      action: "UPDATE",
      before: {
        name: existing.name,
        description: existing.description,
        color: existing.color,
        icon: existing.icon,
        status: existing.status,
      },
      after: {
        name: updated.name,
        description: updated.description,
        color: updated.color,
        icon: updated.icon,
        status: updated.status,
      },
    });

    return updated;
  }

  const created = await prisma.project.create({
    data: createPayload,
  });

  await logAuditEvent({
    workspaceId,
    userId: ownerId,
    entity: "PROJECT",
    entityId: created.id,
    action: "CREATE",
    after: {
      name: created.name,
      description: created.description,
      color: created.color,
      icon: created.icon,
      status: created.status,
    },
  });

  return created;
}

export async function deleteProject(workspaceId: string, userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
      deletedAt: null,
    },
  });

  if (!project) {
    throw new Error("No se encontró el proyecto dentro de este workspace.");
  }

  const runningEntry = await prisma.timeEntry.findFirst({
    where: {
      workspaceId,
      projectId,
      isRunning: true,
    },
  });

  if (runningEntry) {
    throw new Error("Detén el cronómetro activo antes de eliminar este proyecto.");
  }

  const now = new Date();

  const updated = await prisma.$transaction(async (tx) => {
    await tx.timeEntry.updateMany({
      where: {
        workspaceId,
        projectId,
        deletedAt: null,
      },
      data: {
        deletedAt: now,
        isRunning: false,
      },
    });

    await tx.task.updateMany({
      where: {
        workspaceId,
        projectId,
        deletedAt: null,
      },
      data: {
        deletedAt: now,
        archivedAt: now,
        status: "ARCHIVED",
      },
    });

    return tx.project.update({
      where: { id: project.id },
      data: {
        deletedAt: now,
        archivedAt: now,
        status: "ARCHIVED",
      },
    });
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "PROJECT",
    entityId: updated.id,
    action: "SOFT_DELETE",
    before: {
      name: project.name,
      description: project.description,
      status: project.status,
    },
    after: {
      status: updated.status,
      deletedAt: updated.deletedAt?.toISOString() ?? null,
    },
  });

  return updated;
}

export async function restoreProject(workspaceId: string, userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      workspaceId,
      deletedAt: { not: null },
    },
  });

  if (!project) {
    throw new Error("No se encontró el proyecto eliminado dentro de este workspace.");
  }

  const restored = await prisma.project.update({
    where: { id: project.id },
    data: {
      deletedAt: null,
      ...(project.status === "ARCHIVED" ? { status: "ACTIVE", archivedAt: null } : {}),
    },
  });

  await logAuditEvent({
    workspaceId,
    userId,
    entity: "PROJECT",
    entityId: restored.id,
    action: "RESTORE",
    before: {
      status: project.status,
      deletedAt: project.deletedAt?.toISOString() ?? null,
    },
    after: {
      status: restored.status,
      deletedAt: restored.deletedAt?.toISOString() ?? null,
    },
  });

  return restored;
}
