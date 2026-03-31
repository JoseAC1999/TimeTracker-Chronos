import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { prisma } from "@/lib/db/prisma";
import { deleteProject, saveProject } from "@/services/projects/project-service";
import { deleteTask, saveTask } from "@/services/tasks/task-service";

const originals = {
  projectFindFirst: prisma.project.findFirst,
  projectUpdate: prisma.project.update,
  projectUpdateMany: prisma.project.updateMany,
  timeEntryFindFirst: prisma.timeEntry.findFirst,
  timeEntryUpdateMany: prisma.timeEntry.updateMany,
  tagCount: prisma.tag.count,
  taskFindFirst: prisma.task.findFirst,
  taskUpdate: prisma.task.update,
  taskUpdateMany: prisma.task.updateMany,
};
const auditLogCreateNoop = (async () => ({ id: "audit-1" })) as typeof prisma.auditLog.create;

function restorePrisma() {
  prisma.auditLog.create = auditLogCreateNoop;
  prisma.project.findFirst = originals.projectFindFirst;
  prisma.project.update = originals.projectUpdate;
  prisma.project.updateMany = originals.projectUpdateMany;
  prisma.timeEntry.findFirst = originals.timeEntryFindFirst;
  prisma.timeEntry.updateMany = originals.timeEntryUpdateMany;
  prisma.tag.count = originals.tagCount;
  prisma.task.findFirst = originals.taskFindFirst;
  prisma.task.update = originals.taskUpdate;
  prisma.task.updateMany = originals.taskUpdateMany;
}

afterEach(() => {
  restorePrisma();
});

prisma.auditLog.create = auditLogCreateNoop;

test("saveProject rejects updates for projects outside the workspace", async () => {
  prisma.project.findFirst = (async () => null) as typeof prisma.project.findFirst;

  await assert.rejects(
    () =>
      saveProject("ws-1", "user-1", {
        id: "project-foreign",
        name: "Proyecto",
        description: "",
        color: "#0F766E",
        icon: "folder-kanban",
        status: "ACTIVE",
      }),
    /proyecto dentro de este workspace/i,
  );
});

test("deleteProject refuses removal when an active timer exists", async () => {
  prisma.project.findFirst = (async () => ({ id: "project-1", workspaceId: "ws-1" })) as typeof prisma.project.findFirst;
  prisma.timeEntry.findFirst = (async () => ({ id: "entry-1", isRunning: true })) as typeof prisma.timeEntry.findFirst;

  await assert.rejects(() => deleteProject("ws-1", "user-1", "project-1"), /detén el cronómetro activo/i);
});

test("saveTask rejects tag ids outside the workspace", async () => {
  prisma.project.findFirst = (async () => ({ id: "project-1", workspaceId: "ws-1" })) as typeof prisma.project.findFirst;
  prisma.tag.count = (async () => 0) as typeof prisma.tag.count;

  await assert.rejects(
    () =>
      saveTask("ws-1", "user-1", {
        projectId: "project-1",
        name: "Task",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        tagIds: ["tag-foreign"],
      }),
    /etiquetas no pertenecen a este workspace/i,
  );
});

test("deleteTask rejects deletion outside the workspace", async () => {
  prisma.task.findFirst = (async () => null) as typeof prisma.task.findFirst;

  await assert.rejects(() => deleteTask("ws-1", "user-1", "task-foreign"), /tarea dentro de este workspace/i);
});
