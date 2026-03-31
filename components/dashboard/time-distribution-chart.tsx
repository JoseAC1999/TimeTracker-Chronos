"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationShort } from "@/lib/utils/time";

export function TimeDistributionChart({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: { name: string; seconds: number; color?: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="seconds" nameKey="name" innerRadius={70} outerRadius={102} paddingAngle={3}>
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color ?? "#0F766E"} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatDurationShort(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full" style={{ backgroundColor: item.color ?? "#0F766E" }} />
                <span className="text-sm font-medium text-slate-800">{item.name}</span>
              </div>
              <span className="text-sm text-slate-500">{formatDurationShort(item.seconds)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
