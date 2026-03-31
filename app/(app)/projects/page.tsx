import Link from "next/link";
import { FolderKanban, Search } from "lucide-react";

import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ProjectGrid } from "@/components/projects/project-grid";
import { EmptyState } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatDurationLong } from "@/lib/utils/time";
import { getProjects } from "@/services/projects/project-service";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string; archived?: string }>;
}) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const showArchived = params.archived === "1";
  const projects = await getProjects(user.workspaceId!, params.search, {
    includeArchived: showArchived,
    includeDeleted: showArchived,
  });
  const totalsData = await prisma.timeEntry.groupBy({
    by: ["projectId"],
    where: { workspaceId: user.workspaceId!, userId: user.id, isRunning: false, deletedAt: null },
    _sum: { durationSec: true },
  });
  const totals = totalsData.reduce<Record<string, number>>((acc, item) => {
    acc[item.projectId] = item._sum.durationSec ?? 0;
    return acc;
  }, {});
  const totalTracked = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const activeProjects = projects.filter((project) => project.status === "ACTIVE").length;
  const search = params.search ?? "";
  const activeQuery = new URLSearchParams({ ...(search ? { search } : {}) });
  const archivedQuery = new URLSearchParams({ ...(search ? { search } : {}), archived: "1" });
  const archivedHref = showArchived ? `/projects${activeQuery.toString() ? `?${activeQuery.toString()}` : ""}` : `/projects?${archivedQuery.toString()}`;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <Card className="overflow-hidden border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.88))]">
          <CardContent className="p-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              <FolderKanban className="size-3.5" />
              Portafolio
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Tus proyectos deberían poder escanearse de un vistazo.</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Esta vista ahora prioriza estado, volumen de trabajo y claridad visual para que decidir dónde entrar o qué limpiar sea inmediato.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Activos</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{activeProjects}</p>
            <p className="mt-2 text-sm text-slate-500">Proyectos en marcha dentro del espacio.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tiempo total</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{formatDurationLong(totalTracked)}</p>
            <p className="mt-2 text-sm text-slate-500">Tiempo ya imputado a proyectos.</p>
          </CardContent>
        </Card>
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
          <div className="flex gap-3">
            <Button type="submit" variant="secondary">
              Filtrar
            </Button>
            {search ? (
              <Button asChild variant="ghost">
                <Link href="/projects">Limpiar</Link>
              </Button>
            ) : null}
            <Button asChild variant={showArchived ? "default" : "ghost"}>
              <Link href={archivedHref}>{showArchived ? "Ocultar archivados" : "Ver archivados"}</Link>
            </Button>
          </div>
        </form>
        <ProjectFormDialog />
      </section>

      {projects.length ? (
        <ProjectGrid projects={projects as never} totals={totals} showArchived={showArchived} />
      ) : (
        <EmptyState title="Todavía no hay proyectos" description="Crea tu primer proyecto para empezar a organizar trabajo y registrar tiempo visualmente." />
      )}
    </div>
  );
}
