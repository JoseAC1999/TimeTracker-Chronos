"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationShort } from "@/lib/utils/time";

export function WeeklyTrendChart({ data }: { data: { label: string; total: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia semanal</CardTitle>
        <CardDescription>Cómo se ha movido tu foco durante los últimos siete días.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} stroke="#94A3B8" />
              <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" tickFormatter={(value) => `${Math.round(value / 3600)}h`} />
              <Tooltip formatter={(value) => formatDurationShort(Number(value ?? 0))} />
              <Bar dataKey="total" fill="#0F766E" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
