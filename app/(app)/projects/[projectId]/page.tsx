import { notFound } from "next/navigation";
import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getPriorityLabel, getProjectStatusLabel, getTaskStatusLabel } from "@/lib/utils/labels";
import { formatDurationLong, formatDurationShort, formatTimeRange } from "@/lib/utils/time";
import { getProjectById } from "@/services/projects/project-service";

export default async function ProjectDetailPage({ params }: { params: Promise<{ projectId: string }> }) {
  const user = await requireUser();
  const { projectId } = await params;
  const project = await getProjectById(user.workspaceId!, projectId);

  if (!project) {
    notFound();
  }

  const tags = await prisma.tag.findMany({
    where: { workspaceId: user.workspaceId! },
    orderBy: { name: "asc" },
  });

  const [tracked, sessionsCount] = await Promise.all([
    prisma.timeEntry.aggregate({
      where: { workspaceId: user.workspaceId!, userId: user.id, projectId, isRunning: false, deletedAt: null },
      _sum: { durationSec: true },
    }),
    prisma.timeEntry.count({
      where: { workspaceId: user.workspaceId!, userId: user.id, projectId, deletedAt: null },
    }),
  ]);

  const totalTrackedSec = tracked._sum.durationSec ?? 0;
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((task) => task.status === "DONE").length;
  const openTasks = project.tasks.filter((task) => task.status !== "DONE" && task.status !== "ARCHIVED").length;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-950 text-white">
        <CardContent className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-teal-300">Detalle del proyecto</p>
            <h3 className="mt-4 text-3xl font-semibold">{project.name}</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{project.description ?? "Todavía no hay descripción."}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Badge variant={project.status === "ACTIVE" ? "success" : "warning"}>{getProjectStatusLabel(project.status)}</Badge>
            <Button asChild variant="secondary">
              <Link href="/sessions">Ver sesiones</Link>
            </Button>
            <ProjectFormDialog project={project} />
            <TaskFormDialog projects={[{ id: project.id, name: project.name }]} tags={tags} defaultProjectId={project.id} />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard
          label="Tiempo imputado"
          value={formatDurationLong(totalTrackedSec)}
          helper="Solo tus sesiones guardadas."
          accent="#99F6E4"
          progress={totalTrackedSec ? 72 : 12}
        />
        <StatCard
          label="Tareas abiertas"
          value={`${openTasks}`}
          helper={totalTasks ? `${doneTasks} completadas · ${totalTasks} totales.` : "Crea tareas para estructurar el trabajo."}
          accent="#BFDBFE"
          progress={totalTasks ? Math.round((openTasks / totalTasks) * 100) : 12}
        />
        <StatCard
          label="Sesiones"
          value={`${sessionsCount}`}
          helper="Sesiones registradas para este proyecto."
          accent="#86EFAC"
          progress={sessionsCount ? 66 : 12}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Tareas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.tasks.length ? (
              project.tasks.map((task) => (
                <div key={task.id} className="rounded-3xl border border-slate-100 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-950">{task.name}</p>
                    <Badge variant={task.status === "DONE" ? "success" : "neutral"}>{getTaskStatusLabel(task.status)}</Badge>
                    <Badge variant={task.priority === "URGENT" ? "danger" : "info"}>{getPriorityLabel(task.priority)}</Badge>
                  </div>
                  {task.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{task.description}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-gradient-to-br from-white via-white to-teal-50/40 p-6">
                <p className="text-lg font-semibold text-slate-950">Todavía no hay tareas en este proyecto</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Crea la primera tarea para guiar el trabajo y registrar sesiones con más precisión.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sesiones recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.timeEntries.length ? (
              project.timeEntries.map((entry) => (
                <div key={entry.id} className="rounded-3xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{entry.task?.name ?? project.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatTimeRange(entry.startedAt, entry.endedAt)}</p>
                  <p className="mt-3 text-sm text-slate-700">{formatDurationShort(entry.durationSec)}</p>
                  {entry.note ? <p className="mt-2 text-sm text-slate-500">{entry.note}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6">
                <p className="text-lg font-semibold text-slate-950">Aún no hay sesiones</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">Inicia el cronómetro dentro de este proyecto o registra tiempo manualmente para empezar a ver actividad.</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link href="/timer">Ir al cronómetro</Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link href="/sessions">Abrir historial</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
