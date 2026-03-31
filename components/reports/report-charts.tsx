"use client";

import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationShort } from "@/lib/utils/time";

export function ReportCharts({
  trend,
  perProject,
  perCategory,
}: {
  trend: { label: string; seconds: number }[];
  perProject: { name: string; color: string; seconds: number }[];
  perCategory: { name: string; color: string; seconds: number }[];
}) {
  const totalProjectSeconds = perProject.reduce((sum, item) => sum + item.seconds, 0);
  const totalCategorySeconds = perCategory.reduce((sum, item) => sum + item.seconds, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader>
          <CardTitle>Tendencia temporal</CardTitle>
          <CardDescription>Cómo evoluciona el tiempo registrado en el rango seleccionado.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#94A3B8" />
              <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" tickFormatter={(value) => `${Math.round(value / 3600)}h`} />
              <Tooltip formatter={(value) => formatDurationShort(Number(value ?? 0))} />
              <Area type="monotone" dataKey="seconds" stroke="#0F766E" fill="url(#trendFill)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reparto por proyecto</CardTitle>
            <CardDescription>Porcentaje del tiempo invertido entre proyectos.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={perProject} dataKey="seconds" innerRadius={65} outerRadius={100}>
                    {perProject.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatDurationShort(Number(value ?? 0))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {perProject.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm font-medium text-slate-800">{item.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">
                    {Math.round(totalProjectSeconds ? (item.seconds / totalProjectSeconds) * 100 : 0)}% · {formatDurationShort(item.seconds)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reparto por categoría</CardTitle>
            <CardDescription>Qué tipo de trabajo estás registrando con más frecuencia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {perCategory.length ? (
              perCategory.map((item) => (
                <div key={item.name} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-sm text-slate-500">{formatDurationShort(item.seconds)}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.max(8, Math.round(totalCategorySeconds ? (item.seconds / totalCategorySeconds) * 100 : 0))}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No hay categorías suficientes para mostrar distribución en este rango.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
