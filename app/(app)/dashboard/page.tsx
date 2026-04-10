import dynamic from "next/dynamic";
import Link from "next/link";
import { FolderPlus, ListTodo, Play, TimerReset, TrendingUp } from "lucide-react";

import { RecentSessions } from "@/components/dashboard/recent-sessions";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { DAILY_TARGET_SECONDS, PROJECTS_PROGRESS_SCALE, SESSIONS_PROGRESS_SCALE } from "@/lib/constants/app";
import { formatDurationLong } from "@/lib/utils/time";
import { getDashboardData } from "@/services/dashboard/dashboard-service";

const TimeDistributionChart = dynamic(
  () => import("@/components/dashboard/time-distribution-chart").then((mod) => mod.TimeDistributionChart),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Cargando gráfico</CardTitle>
          <CardDescription>Preparando la visualización…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 animate-pulse rounded-3xl bg-slate-100" />
        </CardContent>
      </Card>
    ),
  },
);

const WeeklyTrendChart = dynamic(
  () => import("@/components/dashboard/weekly-trend-chart").then((mod) => mod.WeeklyTrendChart),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Cargando tendencia</CardTitle>
          <CardDescription>Preparando la serie semanal…</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 animate-pulse rounded-3xl bg-slate-100" />
        </CardContent>
      </Card>
    ),
  },
);

export default async function DashboardPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.workspaceId!, user.id);
  const topProject = [...data.byProject].sort((a, b) => b.seconds - a.seconds)[0];
  const weeklyTotal = data.weeklyTimeline.reduce((total, item) => total + item.total, 0);
  const averageDaily = data.weeklyTimeline.length ? Math.round(weeklyTotal / data.weeklyTimeline.length) : 0;
  const productiveDays = data.weeklyTimeline.filter((item) => item.total > 0).length;
  const focusShare = data.totalTodaySeconds > 0 && topProject ? Math.round((topProject.seconds / data.totalTodaySeconds) * 100) : 0;
  const latestSession = data.recentEntries[0];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(240,253,250,0.88))] p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)] lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
              <TrendingUp className="size-3.5" />
              Panorama de hoy
            </p>
            <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">
              {data.totalTodaySeconds > 0 ? "Tu jornada ya tiene una historia clara." : "Todo listo para empezar a registrar con foco."}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
              {data.totalTodaySeconds > 0
                ? `Llevas ${formatDurationLong(data.totalTodaySeconds)} hoy y ${focusShare}% del tiempo se concentra en ${topProject?.name ?? "tu principal frente de trabajo"}.`
                : "Aún no hay sesiones hoy. Usa el cronómetro para capturar foco en tiempo real o registra bloques manuales si vienes de una reunión o trabajo offline."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/timer">
                  <Play className="size-4" />
                  Abrir cronómetro
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/reports">
                  <TrendingUp className="size-4" />
                  Ver reportes
                </Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Ritmo semanal</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{formatDurationLong(weeklyTotal)}</p>
              <p className="mt-2 text-sm text-slate-500">Total acumulado en los últimos siete días.</p>
            </div>
            <div className="rounded-[28px] border border-white/80 bg-white/85 p-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Media diaria</p>
              <p className="mt-3 text-2xl font-semibold text-slate-950">{formatDurationLong(averageDaily)}</p>
              <p className="mt-2 text-sm text-slate-500">Promedio reciente para calibrar carga y consistencia.</p>
            </div>
            <div className="rounded-[28px] border border-white/80 bg-slate-950 p-5 text-white shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">Continuidad</p>
              <p className="mt-3 text-2xl font-semibold">{productiveDays}/7 días</p>
              <p className="mt-2 text-sm text-slate-300">Días con actividad registrada en la última semana.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Hoy"
          value={formatDurationLong(data.totalTodaySeconds)}
          helper="Tiempo registrado hoy en todas tus sesiones."
          accent="#99F6E4"
          progress={Math.min(Math.round((data.totalTodaySeconds / DAILY_TARGET_SECONDS) * 100), 100)}
        />
        <StatCard
          label="Proyecto principal"
          value={topProject?.name ?? "Sin sesiones"}
          helper={topProject ? formatDurationLong(topProject.seconds) : "Empieza a registrar tiempo para verlo aquí."}
          accent={topProject?.color ?? "#BFDBFE"}
          progress={focusShare || 18}
        />
        <StatCard
          label="Sesiones recientes"
          value={String(data.recentEntries.length)}
          helper="Últimos bloques registrados en tu espacio."
          accent="#FDE68A"
          progress={Math.min(data.recentEntries.length * SESSIONS_PROGRESS_SCALE, 100)}
        />
        <StatCard
          label="Proyectos activos"
          value={String(data.projects.length)}
          helper="Proyectos activos o actualizados recientemente."
          accent="#FBCFE8"
          progress={Math.min(data.projects.length * PROJECTS_PROGRESS_SCALE, 100)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TimeDistributionChart title="Tiempo por proyecto" description="Mira cómo se reparte el día entre tu trabajo activo." data={data.byProject} />
        <TimeDistributionChart
          title="Tiempo por actividad"
          description="Identifica qué tareas o tipos de actividad se están llevando el día."
          data={data.byTask.map((item) => ({ ...item, color: "#2563EB" }))}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="bg-slate-950 text-white">
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
            <CardDescription className="text-slate-300">Atajos para arrancar tu día sin navegar de más.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/projects">
                <FolderPlus className="size-4" />
                Nuevo proyecto
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/tasks">
                <ListTodo className="size-4" />
                Nueva tarea
              </Link>
            </Button>
            <Button asChild variant="soft" className="justify-start bg-white/10 text-white hover:bg-white/15">
              <Link href="/timer">
                <Play className="size-4" />
                Iniciar cronómetro
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pulso del día</CardTitle>
            <CardDescription>Una lectura rápida para saber si tu jornada está concentrada o fragmentada.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-700">Proyecto con más foco</p>
              <p className="mt-3 text-xl font-semibold text-slate-950">{topProject?.name ?? "Todavía sin foco dominante"}</p>
            </div>
            <div className="rounded-3xl bg-sky-50 p-5">
              <p className="text-sm font-medium text-sky-700">Último ritmo capturado</p>
              <p className="mt-3 text-xl font-semibold text-slate-950">{latestSession?.task?.name ?? latestSession?.project.name ?? "Sin sesiones recientes"}</p>
            </div>
            <div className="rounded-3xl bg-amber-50 p-5">
              <p className="text-sm font-medium text-amber-700">Consistencia esta semana</p>
              <p className="mt-3 text-xl font-semibold text-slate-950">
                {productiveDays >= 5 ? "Muy estable" : productiveDays >= 3 ? "En construcción" : "Conviene reforzar hábito"}
              </p>
            </div>
            <div className="rounded-3xl bg-slate-100 p-5">
              <p className="text-sm font-medium text-slate-700">Última acción útil</p>
              <p className="mt-3 text-xl font-semibold text-slate-950">{latestSession?.note ? "Hay contexto escrito" : "Añadir notas daría más trazabilidad"}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <Card className="border-none bg-[linear-gradient(135deg,_rgba(15,23,42,0.96),_rgba(15,118,110,0.88))] text-white">
          <CardHeader>
            <CardTitle>Lectura operativa</CardTitle>
            <CardDescription className="text-slate-200">
              Qué conviene hacer ahora para que el registro siga siendo útil, limpio y accionable.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-3xl bg-white/10 p-4">
              <p className="text-sm font-semibold text-white">Siguiente mejor paso</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {data.totalTodaySeconds > 0
                  ? "Mantén el registro dentro del proyecto dominante o cierra el bloque actual con una nota para que los reportes cuenten una historia más clara."
                  : "Inicia el primer bloque del día desde Cronómetro y usa una nota breve para dejar claro el objetivo del trabajo."}
              </p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4">
              <p className="text-sm font-semibold text-white">Señal a vigilar</p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {data.recentEntries.length >= 4
                  ? "Tienes suficiente actividad reciente como para empezar a detectar cambios de contexto y fragmentación."
                  : "Todavía hay pocas sesiones recientes. A medida que registres más, este tablero ganará más poder diagnóstico."}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atención inmediata</CardTitle>
            <CardDescription>Microdecisiones de producto para ayudarte a no perder el hilo del trabajo.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
              <TimerReset className="mt-0.5 size-4 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Revisa cambios de contexto</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Si encadenas muchas sesiones cortas, conviene agrupar o simplificar tareas para que el reporte final sea más legible.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-3xl bg-slate-50 p-4">
              <ListTodo className="mt-0.5 size-4 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Mantén proyectos vivos</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Actualiza estados y nombres con precisión. Un catálogo ordenado hace que iniciar el cronómetro sea mucho más rápido.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <WeeklyTrendChart data={data.weeklyTimeline} />
        <RecentSessions entries={data.recentEntries as never} />
      </section>
    </div>
  );
}
