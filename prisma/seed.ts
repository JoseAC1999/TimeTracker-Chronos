import bcrypt from "bcryptjs";
import { addHours, startOfDay, subDays } from "date-fns";

import { PrismaClient, ProjectStatus, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoEmail = process.env.DEMO_USER_EMAIL ?? "demo@chronos.app";
  const demoPassword = process.env.DEMO_USER_PASSWORD ?? "Password123!";
  const passwordHash = await bcrypt.hash(demoPassword, 12);

  await prisma.timeEntryTag.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.userSetting.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      name: "Jose Ascanio",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Chronos Studio",
      slug: "chronos-studio",
      ownerId: user.id,
      users: {
        connect: { id: user.id },
      },
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { workspaceId: workspace.id },
  });

  await prisma.userSetting.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      timezone: "Europe/Madrid",
      dayStartHour: 8,
      weekStartsOn: 1,
    },
  });

  const [designTag, focusTag, opsTag] = await Promise.all([
    prisma.tag.create({ data: { workspaceId: workspace.id, name: "Design", color: "#FB7185" } }),
    prisma.tag.create({ data: { workspaceId: workspace.id, name: "Focus", color: "#2DD4BF" } }),
    prisma.tag.create({ data: { workspaceId: workspace.id, name: "Ops", color: "#FBBF24" } }),
  ]);

  const [saasProject, clientProject, opsProject] = await Promise.all([
    prisma.project.create({
      data: {
        workspaceId: workspace.id,
        ownerId: user.id,
        name: "Chronos SaaS",
        description: "Producto principal de time tracking",
        color: "#0F766E",
        icon: "rocket",
        status: ProjectStatus.ACTIVE,
      },
    }),
    prisma.project.create({
      data: {
        workspaceId: workspace.id,
        ownerId: user.id,
        name: "Client Portal Refresh",
        description: "Rediseño del portal del cliente",
        color: "#2563EB",
        icon: "monitor-play",
        status: ProjectStatus.ON_HOLD,
      },
    }),
    prisma.project.create({
      data: {
        workspaceId: workspace.id,
        ownerId: user.id,
        name: "Business Ops",
        description: "Procesos internos y operativos",
        color: "#D97706",
        icon: "briefcase-business",
        status: ProjectStatus.ACTIVE,
      },
    }),
  ]);

  const [dashboardTask, timerTask, motionTask, financeTask] = await Promise.all([
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: saasProject.id,
        ownerId: user.id,
        name: "Dashboard analytics",
        description: "Diseñar los widgets del resumen principal",
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        taskTags: {
          create: [{ tagId: designTag.id }, { tagId: focusTag.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: saasProject.id,
        ownerId: user.id,
        name: "Timer conflict flow",
        description: "Definir qué hacer al arrancar un segundo cronómetro",
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        taskTags: {
          create: [{ tagId: focusTag.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: clientProject.id,
        ownerId: user.id,
        name: "Homepage motion polish",
        description: "Pulido visual y animaciones",
        status: TaskStatus.BLOCKED,
        priority: TaskPriority.MEDIUM,
        taskTags: {
          create: [{ tagId: designTag.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        workspaceId: workspace.id,
        projectId: opsProject.id,
        ownerId: user.id,
        name: "Weekly finance review",
        description: "Revisión financiera operativa",
        status: TaskStatus.DONE,
        priority: TaskPriority.LOW,
        taskTags: {
          create: [{ tagId: opsTag.id }],
        },
      },
    }),
  ]);

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  await Promise.all([
    prisma.timeEntry.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        projectId: saasProject.id,
        taskId: dashboardTask.id,
        startedAt: addHours(today, 8),
        endedAt: addHours(today, 9),
        durationSec: 3600,
        isRunning: false,
        note: "Análisis del resumen diario",
        entryTags: { create: [{ tagId: designTag.id }, { tagId: focusTag.id }] },
      },
    }),
    prisma.timeEntry.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        projectId: saasProject.id,
        taskId: timerTask.id,
        startedAt: addHours(today, 9.5),
        endedAt: addHours(today, 11),
        durationSec: 5400,
        isRunning: false,
        note: "Flujo de conflicto entre tareas",
        entryTags: { create: [{ tagId: focusTag.id }] },
      },
    }),
    prisma.timeEntry.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        projectId: opsProject.id,
        taskId: financeTask.id,
        startedAt: addHours(yesterday, 15),
        endedAt: addHours(yesterday, 16.5),
        durationSec: 5400,
        isRunning: false,
        note: "Revisión de métricas de negocio",
        entryTags: { create: [{ tagId: opsTag.id }] },
      },
    }),
    prisma.timeEntry.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        projectId: clientProject.id,
        taskId: motionTask.id,
        startedAt: addHours(subDays(today, 3), 10),
        endedAt: addHours(subDays(today, 3), 12),
        durationSec: 7200,
        isRunning: false,
        note: "Iteración visual del portal",
        entryTags: { create: [{ tagId: designTag.id }] },
      },
    }),
    prisma.timeEntry.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        projectId: saasProject.id,
        taskId: dashboardTask.id,
        startedAt: addHours(today, 11.5),
        durationSec: 0,
        isRunning: true,
        note: "Refinando analítica del dashboard",
      },
    }),
  ]);

  console.log(`Seed completed for ${demoEmail}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
