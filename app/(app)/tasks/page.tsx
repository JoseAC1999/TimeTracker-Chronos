import Link from "next/link";
import { ListTodo, Search } from "lucide-react";

import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { TaskList } from "@/components/tasks/task-list";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getTasks } from "@/services/tasks/task-service";

export default async function TasksPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; projectId?: string; archived?: string }>;
}) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const search = params.search ?? "";
  const selectedProjectId = params.projectId ?? "";
  const showArchived = params.archived === "1";
  const [tasks, projects, tags] = await Promise.all([
    getTasks(user.workspaceId!, search, selectedProjectId, {
      includeArchived: showArchived,
      includeDeleted: showArchived,
    }),
    prisma.project.findMany({ where: { workspaceId: user.workspaceId!, deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ where: { workspaceId: user.workspaceId! }, orderBy: { name: "asc" } }),
  ]);

  const totalTasks = tasks.length;
  const archivedTasks = tasks.filter((task) => task.status === "ARCHIVED").length;
  const doneTasks = tasks.filter((task) => task.status === "DONE").length;
  const blockedTasks = tasks.filter((task) => task.status === "BLOCKED").length;
  const openTasks = tasks.filter((task) => task.status !== "DONE" && task.status !== "ARCHIVED").length;
  const isFiltered = Boolean(search || selectedProjectId);
  const activeQuery = new URLSearchParams({ ...(search ? { search } : {}), ...(selectedProjectId ? { projectId: selectedProjectId } : {}) });
  const archivedQuery = new URLSearchParams({ ...(search ? { search } : {}), ...(selectedProjectId ? { projectId: selectedProjectId } : {}), archived: "1" });
  const archivedHref = showArchived ? `/tasks${activeQuery.toString() ? `?${activeQuery.toString()}` : ""}` : `/tasks?${archivedQuery.toString()}`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr_0.75fr]">
        <Card className="overflow-hidden border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(240,253,250,0.86))]">
          <CardContent className="p-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              <ListTodo className="size-3.5" />
              Tareas
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Organiza el trabajo en unidades claras, reutilizables y medibles.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Usa tareas para registrar sesiones con más precisión, detectar bloqueos y mantener el foco por proyecto.
            </p>
          </CardContent>
        </Card>
        <StatCard
          label="Abiertas"
          value={`${openTasks}`}
          helper="Pendientes, en curso o bloqueadas."
          accent="#99F6E4"
          progress={totalTasks ? Math.round((openTasks / totalTasks) * 100) : 12}
        />
        <StatCard
          label="Completadas"
          value={`${doneTasks}`}
          helper={totalTasks ? `Sobre ${totalTasks} tareas visibles.` : "Todavía no hay tareas en el workspace."}
          accent="#86EFAC"
          progress={totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 12}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-[28px] border border-white/80 bg-white/75 p-4 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
        <form className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Buscar por nombre o descripción..."
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-11 text-sm shadow-sm outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
          <div className="min-w-[240px]">
            <select
              name="projectId"
              defaultValue={selectedProjectId}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm outline-none focus:border-teal-300 focus:ring-4 focus:ring-teal-500/10"
            >
              <option value="">Todos los proyectos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="secondary">
              Filtrar
            </Button>
            {isFiltered ? (
              <Button asChild variant="ghost">
                <Link href="/tasks">Limpiar</Link>
              </Button>
            ) : null}
            <Button asChild variant={showArchived ? "default" : "ghost"}>
              <Link href={archivedHref}>{showArchived ? "Ocultar archivadas" : "Ver archivadas"}</Link>
            </Button>
          </div>
        </form>
        <div className="flex flex-wrap items-center gap-3">
          {blockedTasks ? (
            <span className="rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-700">
              {blockedTasks} bloqueada{blockedTasks === 1 ? "" : "s"}
            </span>
          ) : null}
          {archivedTasks ? (
            <span className="rounded-full bg-slate-500/10 px-4 py-2 text-sm font-semibold text-slate-700">
              {archivedTasks} archivada{archivedTasks === 1 ? "" : "s"}
            </span>
          ) : null}
          <TaskFormDialog projects={projects} tags={tags} />
        </div>
      </section>

      {tasks.length ? (
        <TaskList tasks={tasks as never} projects={projects} tags={tags} showArchived={showArchived} />
      ) : isFiltered ? (
        <EmptyState
          title="No hay resultados con estos filtros"
          description="Prueba con otro texto de búsqueda o cambia el proyecto seleccionado. Si estabas buscando una tarea antigua, revisa si quedó archivada."
          actionLabel="Limpiar filtros"
          actionHref="/tasks"
        />
      ) : (
        <EmptyState
          title="Todavía no hay tareas"
          description="Crea una tarea dentro de un proyecto y úsala como punto de partida para tus sesiones."
          actionLabel="Crear primera tarea"
          actionHref="/projects"
        />
      )}
    </div>
  );
}
