import Link from "next/link";
import { ArrowRight, FolderKanban, RotateCcw, Trash2 } from "lucide-react";

import { deleteProjectAction, restoreProjectAction } from "@/app/actions/project-actions";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectStatusLabel } from "@/lib/utils/labels";
import { formatDurationShort } from "@/lib/utils/time";
import type { ProjectWithMeta } from "@/types/domain";

export function ProjectGrid({
  projects,
  totals,
  showArchived = false,
}: {
  projects: ProjectWithMeta[];
  totals: Record<string, number>;
  showArchived?: boolean;
}) {
  const maxTracked = Math.max(...projects.map((project) => totals[project.id] ?? 0), 1);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden border-white/80 bg-gradient-to-br from-white via-white to-slate-50/70">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-3xl" style={{ backgroundColor: `${project.color}20`, color: project.color }}>
                  <FolderKanban className="size-6" />
                </div>
                <div>
                  <Link href={`/projects/${project.id}`} className="text-lg font-semibold text-slate-950 hover:text-teal-700">
                    {project.name}
                  </Link>
                  <p className="text-sm text-slate-500">{project.description ?? "Todavía no hay descripción"}</p>
                </div>
              </div>
              <Badge variant={project.status === "ACTIVE" ? "success" : project.status === "ON_HOLD" ? "warning" : "neutral"}>
                {getProjectStatusLabel(project.status)}
              </Badge>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span>Peso relativo</span>
                <span>{Math.round(((totals[project.id] ?? 0) / maxTracked) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(10, Math.round(((totals[project.id] ?? 0) / maxTracked) * 100))}%`, backgroundColor: project.color }}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tareas</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{project._count.tasks}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sesiones</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{project._count.timeEntries}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Registrado</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">{formatDurationShort(totals[project.id] ?? 0)}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="soft">
                <Link href={`/projects/${project.id}`}>
                  Abrir detalle
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <ProjectFormDialog project={project} />
              {showArchived && project.deletedAt ? (
                <form action={restoreProjectAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button type="submit" variant="secondary">
                    <RotateCcw className="size-4" />
                    Restaurar
                  </Button>
                </form>
              ) : (
                <form action={deleteProjectAction}>
                  <input type="hidden" name="projectId" value={project.id} />
                  <Button type="submit" variant="ghost">
                    <Trash2 className="size-4" />
                    Eliminar
                  </Button>
                </form>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
