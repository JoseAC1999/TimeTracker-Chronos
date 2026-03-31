import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { deleteTimeEntryAction, restoreTimeEntryAction } from "@/app/actions/time-entry-actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { ManualEntryForm } from "@/components/timer/manual-entry-form";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { cn } from "@/lib/utils/cn";
import { formatDurationLong, formatDurationShort, formatTimeRange } from "@/lib/utils/time";
import { getSessions } from "@/services/time-entries/time-entry-service";

export default async function SessionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: "day" | "week" | "month"; deleted?: string }>;
}) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const range = params.range ?? "week";
  const showDeleted = params.deleted === "1";
  const [entries, projects, tasks, tags] = await Promise.all([
    getSessions(user.workspaceId!, user.id, { range }, { includeDeleted: showDeleted }),
    prisma.project.findMany({ where: { workspaceId: user.workspaceId!, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.task.findMany({ where: { workspaceId: user.workspaceId!, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ where: { workspaceId: user.workspaceId! }, orderBy: { name: "asc" } }),
  ]);

  const trackedSec = entries.reduce((sum, entry) => sum + entry.durationSec, 0);
  const runningCount = entries.filter((entry) => entry.isRunning).length;
  const completedCount = entries.filter((entry) => !entry.isRunning).length;
  const averageSec = completedCount ? Math.round(trackedSec / completedCount) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Tiempo registrado"
          value={formatDurationLong(trackedSec)}
          helper="Suma de sesiones del rango actual."
          accent="#99F6E4"
          progress={trackedSec ? 72 : 12}
        />
        <StatCard
          label="Sesiones guardadas"
          value={`${completedCount}`}
          helper="Bloques terminados listos para reportar."
          accent="#86EFAC"
          progress={completedCount ? 66 : 12}
        />
        <StatCard
          label="Promedio"
          value={formatDurationShort(averageSec)}
          helper="Duración media por sesión guardada."
          accent="#BFDBFE"
          progress={averageSec ? 58 : 12}
        />
      </section>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div>
              <CardTitle>Historial de sesiones</CardTitle>
              <p className="mt-2 text-sm text-slate-500">Revisa, edita y limpia el trabajo que has registrado.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "day" as const, label: "Día", href: "/sessions?range=day" },
                { key: "week" as const, label: "Semana", href: "/sessions?range=week" },
                { key: "month" as const, label: "Mes", href: "/sessions?range=month" },
              ].map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium ring-1 ring-slate-200 transition",
                    range === item.key ? "bg-slate-950 text-white ring-slate-950" : "bg-white/80 text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              {runningCount ? (
                <span className="rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-700">
                  {runningCount} en curso
                </span>
              ) : null}
              <Link
                href={showDeleted ? `/sessions?range=${range}` : `/sessions?range=${range}&deleted=1`}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium ring-1 ring-slate-200 transition",
                  showDeleted ? "bg-slate-950 text-white ring-slate-950" : "bg-white/80 text-slate-600 hover:bg-slate-50",
                )}
              >
                {showDeleted ? "Ocultar eliminadas" : "Ver eliminadas"}
              </Link>
            </div>
          </div>
          <ManualEntryForm projects={projects} tasks={tasks.map((task) => ({ id: task.id, name: task.name, projectId: task.projectId }))} tags={tags} />
        </CardHeader>
        <CardContent className="space-y-4">
          {entries.length ? (
            entries.map((entry) => (
              <div key={entry.id} className="rounded-[28px] border border-slate-100 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-950">{entry.task?.name ?? entry.project.name}</h3>
                      <Badge variant={entry.isRunning ? "warning" : "success"}>{entry.isRunning ? "En curso" : "Guardada"}</Badge>
                      {entry.deletedAt ? <Badge variant="warning">Eliminada</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{entry.project.name}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {format(entry.startedAt, "PPP", { locale: es })} · {formatTimeRange(entry.startedAt, entry.endedAt)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.entryTags.map(({ tag }) => (
                        <span key={tag.id} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                          {tag.name}
                        </span>
                      ))}
                    </div>
                    {entry.note ? <p className="mt-3 text-sm leading-6 text-slate-600">{entry.note}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">{formatDurationShort(entry.durationSec)}</span>
                    {!entry.deletedAt ? (
                      <ManualEntryForm
                        projects={projects}
                        tasks={tasks.map((task) => ({ id: task.id, name: task.name, projectId: task.projectId }))}
                        tags={tags}
                        entry={{
                          id: entry.id,
                          projectId: entry.projectId,
                          taskId: entry.taskId,
                          startedAt: format(entry.startedAt, "yyyy-MM-dd'T'HH:mm"),
                          endedAt: entry.endedAt ? format(entry.endedAt, "yyyy-MM-dd'T'HH:mm") : format(entry.startedAt, "yyyy-MM-dd'T'HH:mm"),
                          note: entry.note,
                          tagIds: entry.entryTags.map((item) => item.tag.id),
                        }}
                      />
                    ) : null}
                    {showDeleted && entry.deletedAt ? (
                      <form action={restoreTimeEntryAction}>
                        <input type="hidden" name="entryId" value={entry.id} />
                        <Button type="submit" variant="secondary">
                          <RotateCcw className="size-4" />
                          Restaurar
                        </Button>
                      </form>
                    ) : (
                      <form action={deleteTimeEntryAction}>
                        <input type="hidden" name="entryId" value={entry.id} />
                        <Button type="submit" variant="ghost">
                          Eliminar
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              title="Todavía no hay sesiones en este rango"
              description="Arranca el cronómetro o registra tiempo manualmente para que este historial se convierta en tu tablero de limpieza y revisión."
              actionLabel="Ir al cronómetro"
              actionHref="/timer"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
