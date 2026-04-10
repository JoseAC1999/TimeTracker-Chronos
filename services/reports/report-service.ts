import { eachDayOfInterval, endOfDay, endOfMonth, endOfWeek, format, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";

import { prisma } from "@/lib/db/prisma";
import { reportFilterSchema, type ReportFilterInput } from "@/lib/validations/time-entry";

export async function getReportData(workspaceId: string, userId: string, filters: Partial<ReportFilterInput>) {
  const parsed = reportFilterSchema.parse({
    range: filters.range ?? "week",
    projectId: filters.projectId,
    taskId: filters.taskId,
    tagId: filters.tagId,
  });

  const now = new Date();
  const start =
    parsed.range === "month"
      ? startOfMonth(now)
      : parsed.range === "week"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : startOfDay(now);
  const end =
    parsed.range === "month"
      ? endOfMonth(now)
      : parsed.range === "week"
        ? endOfWeek(now, { weekStartsOn: 1 })
        : endOfDay(now);

  const [entries, tags, projects, tasks] = await Promise.all([
    prisma.timeEntry.findMany({
      where: {
        workspaceId,
        userId,
        deletedAt: null,
        startedAt: { gte: start, lte: end },
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
      orderBy: { startedAt: "desc" },
      take: 1000,
    }),
    prisma.tag.findMany({ where: { workspaceId }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.task.findMany({ where: { workspaceId, deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  const totalSeconds = entries.reduce((sum, entry) => sum + entry.durationSec, 0);

  const perProject = Object.values(
    entries.reduce<Record<string, { name: string; color: string; seconds: number }>>((acc, entry) => {
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

  const perCategory = Object.values(
    entries.reduce<Record<string, { name: string; color: string; seconds: number }>>((acc, entry) => {
      const tagsForEntry = entry.entryTags.length ? entry.entryTags : [{ tag: { id: "untagged", name: "Sin categoría", color: "#94A3B8" } }];
      for (const item of tagsForEntry) {
        if (!acc[item.tag.id]) {
          acc[item.tag.id] = {
            name: item.tag.name,
            color: item.tag.color,
            seconds: 0,
          };
        }
        acc[item.tag.id].seconds += entry.durationSec / tagsForEntry.length;
      }
      return acc;
    }, {}),
  );

  const trendTotals = entries.reduce<Record<string, number>>((acc, entry) => {
    const key = format(entry.startedAt, "yyyy-MM-dd");
    acc[key] = (acc[key] ?? 0) + entry.durationSec;
    return acc;
  }, {});

  const trend = eachDayOfInterval({ start, end }).map((date) => {
    const key = format(date, "yyyy-MM-dd");
    const label = format(date, "dd MMM", { locale: es });
    const seconds = trendTotals[key] ?? 0;

    return { label, seconds };
  });

  return {
    entries,
    tags,
    projects,
    tasks,
    totalSeconds,
    perProject,
    perCategory,
    trend,
    range: parsed.range,
  };
}
