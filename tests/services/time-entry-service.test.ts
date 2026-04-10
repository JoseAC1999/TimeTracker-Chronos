import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

import { prisma } from "@/lib/db/prisma";
import { saveManualTimeEntry, startTimer } from "@/services/time-entries/time-entry-service";

const originals = {
  projectFindFirst: prisma.project.findFirst,
  taskFindFirst: prisma.task.findFirst,
  tagCount: prisma.tag.count,
  timeEntryFindFirst: prisma.timeEntry.findFirst,
  timeEntryCreate: prisma.timeEntry.create,
};
const auditLogCreateNoop = (async () => ({ id: "audit-1" })) as unknown as typeof prisma.auditLog.create;

function restorePrisma() {
  prisma.auditLog.create = auditLogCreateNoop;
  prisma.project.findFirst = originals.projectFindFirst;
  prisma.task.findFirst = originals.taskFindFirst;
  prisma.tag.count = originals.tagCount;
  prisma.timeEntry.findFirst = originals.timeEntryFindFirst;
  prisma.timeEntry.create = originals.timeEntryCreate;
}

afterEach(() => {
  restorePrisma();
});

prisma.auditLog.create = auditLogCreateNoop;

test("startTimer rejects a task that does not belong to the selected project", async () => {
  prisma.project.findFirst = (async () => ({ id: "project-1", workspaceId: "ws-1" })) as typeof prisma.project.findFirst;
  prisma.task.findFirst = (async () => ({ id: "task-1", workspaceId: "ws-1", projectId: "project-2" })) as typeof prisma.task.findFirst;

  await assert.rejects(
    () =>
      startTimer("ws-1", "user-1", {
        projectId: "project-1",
        taskId: "task-1",
        note: "focus block",
        conflictStrategy: "prompt",
      }),
    /no pertenece al proyecto indicado/i,
  );
});

test("startTimer creates a running entry when access checks pass", async () => {
  prisma.project.findFirst = (async () => ({ id: "project-1", workspaceId: "ws-1" })) as typeof prisma.project.findFirst;
  prisma.task.findFirst = (async () => ({ id: "task-1", workspaceId: "ws-1", projectId: "project-1" })) as typeof prisma.task.findFirst;
  prisma.timeEntry.findFirst = (async () => null) as typeof prisma.timeEntry.findFirst;
  prisma.timeEntry.create = (async ({ data }) => ({ id: "entry-1", ...data })) as typeof prisma.timeEntry.create;

  const created = await startTimer("ws-1", "user-1", {
    projectId: "project-1",
    taskId: "task-1",
    note: "focus block",
    conflictStrategy: "prompt",
  });

  assert.equal(created.workspaceId, "ws-1");
  assert.equal(created.userId, "user-1");
  assert.equal(created.projectId, "project-1");
  assert.equal(created.taskId, "task-1");
  assert.equal(created.isRunning, true);
});

test("saveManualTimeEntry rejects tags outside the workspace", async () => {
  prisma.project.findFirst = (async () => ({ id: "project-1", workspaceId: "ws-1" })) as typeof prisma.project.findFirst;
  prisma.tag.count = (async () => 0) as typeof prisma.tag.count;

  await assert.rejects(
    () =>
      saveManualTimeEntry("ws-1", "user-1", {
        projectId: "project-1",
        taskId: null,
        note: "manual entry",
        startedAt: "2026-03-31T09:00:00.000Z",
        endedAt: "2026-03-31T10:00:00.000Z",
        tagIds: ["tag-foreign"],
      }),
    /etiquetas no pertenecen a este workspace/i,
  );
});

test("saveManualTimeEntry rejects updates for entries not owned by the user", async () => {
  prisma.project.findFirst = (async () => ({ id: "project-1", workspaceId: "ws-1" })) as typeof prisma.project.findFirst;
  prisma.tag.count = (async () => 0) as typeof prisma.tag.count;
  prisma.timeEntry.findFirst = (async () => null) as typeof prisma.timeEntry.findFirst;

  await assert.rejects(
    () =>
      saveManualTimeEntry("ws-1", "user-1", {
        id: "entry-foreign",
        projectId: "project-1",
        taskId: null,
        note: "manual entry",
        startedAt: "2026-03-31T09:00:00.000Z",
        endedAt: "2026-03-31T10:00:00.000Z",
        tagIds: [],
      }),
    /no se encontró la entrada de tiempo/i,
  );
});
