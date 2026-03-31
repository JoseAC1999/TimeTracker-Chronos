import { Clock3, PencilRuler, Waves } from "lucide-react";

import { ManualEntryForm } from "@/components/timer/manual-entry-form";
import { TimerLauncher } from "@/components/timer/timer-launcher";
import { TimelineView } from "@/components/timer/timeline-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { formatDurationLong } from "@/lib/utils/time";
import { getSessions, getTimerPageData } from "@/services/time-entries/time-entry-service";

export default async function TimerPage() {
  const user = await requireUser();
  const [{ activeEntry, projects, tasks }, tags, sessions] = await Promise.all([
    getTimerPageData(user.workspaceId!, user.id),
    prisma.tag.findMany({ where: { workspaceId: user.workspaceId! }, orderBy: { name: "asc" } }),
    getSessions(user.workspaceId!, user.id, { range: "day" }),
  ]);
  const totalToday = sessions.reduce((sum, entry) => sum + entry.durationSec, 0);
  const focusedProjectCount = new Set(sessions.map((entry) => entry.projectId)).size;
  const averageBlock = sessions.length ? Math.round(totalToday / sessions.length) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <Card className="overflow-hidden border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.2),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(236,253,245,0.88))]">
          <CardContent className="p-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              <Clock3 className="size-3.5" />
              Modo enfoque
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
              {activeEntry ? "Ya tienes una sesión corriendo." : "Listo para capturar el siguiente bloque."}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {activeEntry
                ? `El cronómetro activo está asociado a ${activeEntry.task?.name ?? activeEntry.project.name}. Si cambias de contexto, resuélvelo desde aquí sin romper la continuidad.`
                : "El mejor registro suele empezar con un proyecto claro, una tarea concreta y una nota breve sobre la intención del bloque."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tiempo hoy</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{formatDurationLong(totalToday)}</p>
            <p className="mt-2 text-sm text-slate-500">Suma de todas las sesiones del día.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Bloque medio</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{formatDurationLong(averageBlock)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Proyectos tocados</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{focusedProjectCount}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TimerLauncher projects={projects} tasks={tasks.map((task) => ({ id: task.id, name: task.name, projectId: task.projectId }))} />
        <Card>
          <CardHeader>
            <CardTitle>Registro manual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-500">Añade una sesión a posteriori, corrige rangos horarios o completa trabajo registrado fuera del cronómetro en vivo.</p>
            <ManualEntryForm
              projects={projects}
              tasks={tasks.map((task) => ({ id: task.id, name: task.name, projectId: task.projectId }))}
              tags={tags}
            />
            {activeEntry ? (
              <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                Hay un cronómetro corriendo para <span className="font-semibold text-slate-900">{activeEntry.task?.name ?? activeEntry.project.name}</span>. Usa la banda superior para pausarlo o detenerlo.
              </div>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <PencilRuler className="size-4" />
                  <p className="text-sm font-semibold">Buena práctica</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">Usa notas cortas y específicas. Luego serán mucho más valiosas en Reportes y revisión semanal.</p>
              </div>
              <div className="rounded-3xl bg-sky-50 p-4">
                <div className="flex items-center gap-2 text-sky-700">
                  <Waves className="size-4" />
                  <p className="text-sm font-semibold">Evita ruido</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">Si una sesión es muy breve, plantéate fusionarla conceptualmente con la anterior para mantener continuidad.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <TimelineView entries={sessions as never} />
    </div>
  );
}
