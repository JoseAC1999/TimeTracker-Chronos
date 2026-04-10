import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { es } from "date-fns/locale";

import { prisma } from "@/lib/db/prisma";

export async function getDashboardData(workspaceId: string, userId: string) {
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);
  const last7Days = subDays(todayStart, 6);

  const [todayEntries, recentEntries, projects, weeklyEntries] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
        startedAt: { gte: todayStart, lte: todayEnd },
      },
      include: { project: true, task: true },
    }),
    prisma.timeEntry.findMany({
      where: { workspaceId, userId, deletedAt: null },
      include: { project: true, task: true },
      orderBy: { startedAt: "desc" },
      take: 6,
    }),
    prisma.project.findMany({
      where: { workspaceId, deletedAt: null },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    prisma.timeEntry.findMany({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
        startedAt: { gte: last7Days, lte: todayEnd },
      },
      select: { durationSec: true, startedAt: true },
    }),
  ]);

  const totalTodaySeconds = todayEntries.reduce((total, entry) => total + entry.durationSec, 0);

  const byProject = Object.values(
    todayEntries.reduce<Record<string, { name: string; color: string; seconds: number }>>((acc, entry) => {
      if (!acc[entry.projectId]) {
        acc[entry.projectId] = {
          name: entry.project.name,
          color: entry.project.color,
          seconds: 0,
        };
      }
      acc[entry.projectId].seconds += entry.durationSec;
      return acc;
    }, {}),
  );

  const byTask = Object.values(
    todayEntries.reduce<Record<string, { name: string; projectName: string; seconds: number }>>((acc, entry) => {
      const key = entry.taskId ?? entry.projectId;
      if (!acc[key]) {
        acc[key] = {
          name: entry.task?.name ?? "Trabajo general",
          projectName: entry.project.name,
          seconds: 0,
        };
      }
      acc[key].seconds += entry.durationSec;
      return acc;
    }, {}),
  );

  const weeklyTotals = weeklyEntries.reduce<Record<string, number>>((acc, entry) => {
    const key = format(entry.startedAt, "yyyy-MM-dd");
    acc[key] = (acc[key] ?? 0) + entry.durationSec;
    return acc;
  }, {});

  const weeklyTimeline = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(todayStart, 6 - index);
    const key = format(date, "yyyy-MM-dd");
    const label = format(date, "EEE", { locale: es });
    const total = weeklyTotals[key] ?? 0;

    return { label, total };
  });

  return {
    totalTodaySeconds,
    byProject,
    byTask,
    recentEntries,
    weeklyTimeline,
    projects,
  };
}
