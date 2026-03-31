import { Activity, PieChart, SlidersHorizontal } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { ReportCharts } from "@/components/reports/report-charts";
import { ReportFilters } from "@/components/reports/report-filters";
import { requireUser } from "@/lib/auth/session";
import { formatDurationLong } from "@/lib/utils/time";
import { getReportData } from "@/services/reports/report-service";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ range?: "day" | "week" | "month"; projectId?: string; taskId?: string; tagId?: string }>;
}) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const data = await getReportData(user.workspaceId!, user.id, params);
  const topProject = [...data.perProject].sort((a, b) => b.seconds - a.seconds)[0];
  const concentration = data.totalSeconds > 0 && topProject ? Math.round((topProject.seconds / data.totalSeconds) * 100) : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <div className="rounded-[32px] border border-white/80 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(240,249,255,0.88))] p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]">
          <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            <Activity className="size-3.5" />
            Lectura analítica
          </p>
          <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">Reportes con más contexto y menos fricción.</h3>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Esta vista ahora ayuda a entender volumen, concentración y mezcla de trabajo antes de entrar a leer cada gráfico.
          </p>
        </div>
        <div className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Concentración</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{concentration}%</p>
          <p className="mt-2 text-sm text-slate-500">Peso del proyecto dominante dentro del rango seleccionado.</p>
        </div>
        <div className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Mezcla</p>
          <p className="mt-3 text-3xl font-semibold text-slate-950">{data.perCategory.length}</p>
          <p className="mt-2 text-sm text-slate-500">Etiquetas o categorías con presencia real en el periodo.</p>
        </div>
      </section>

      <ReportFilters
        range={data.range}
        projects={data.projects}
        tasks={data.tasks}
        tags={data.tags}
        selectedProjectId={params.projectId}
        selectedTaskId={params.taskId}
        selectedTagId={params.tagId}
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Tiempo total"
          value={formatDurationLong(data.totalSeconds)}
          helper="Dentro del periodo seleccionado."
          accent="#99F6E4"
          progress={Math.min(Math.round((data.totalSeconds / 144000) * 100), 100)}
        />
        <StatCard
          label="Proyecto dominante"
          value={topProject?.name ?? "Sin datos"}
          helper={topProject ? formatDurationLong(topProject.seconds) : "No hay tiempo registrado en este rango."}
          accent={topProject?.color ?? "#BFDBFE"}
          progress={concentration || 16}
        />
        <StatCard
          label="Categorías"
          value={String(data.perCategory.length)}
          helper="Categorías distintas dentro del rango."
          accent="#FDE68A"
          progress={Math.min(data.perCategory.length * 20, 100)}
        />
        <StatCard
          label="Sesiones"
          value={String(data.entries.length)}
          helper="Entradas capturadas tras aplicar filtros."
          accent="#FBCFE8"
          progress={Math.min(data.entries.length * 8, 100)}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[28px] border border-white/80 bg-slate-950 p-6 text-white shadow-[0_28px_80px_-40px_rgba(15,23,42,0.55)]">
          <div className="flex items-center gap-2 text-teal-200">
            <SlidersHorizontal className="size-4" />
            <p className="text-sm font-semibold">Cómo leer este reporte</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Si la concentración es muy alta, probablemente estás dedicando foco real a un frente principal. Si es baja, revisa si hubo demasiados cambios de contexto o si faltan etiquetas para diferenciar mejor el trabajo.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/85 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)]">
          <div className="flex items-center gap-2 text-slate-700">
            <PieChart className="size-4" />
            <p className="text-sm font-semibold">Lectura rápida del rango</p>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {data.totalSeconds > 0
              ? `El periodo muestra ${formatDurationLong(data.totalSeconds)} repartidos en ${data.entries.length} sesiones. ${topProject ? `${topProject.name} concentra ${concentration}% del esfuerzo.` : ""}`
              : "Todavía no hay actividad en este rango. Cuando aparezcan sesiones, aquí verás una síntesis útil antes de bajar a los gráficos."}
          </p>
        </div>
      </section>

      <ReportCharts trend={data.trend} perProject={data.perProject} perCategory={data.perCategory} />
    </div>
  );
}
