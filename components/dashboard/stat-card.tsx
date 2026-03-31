import { ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  helper,
  accent,
  progress,
}: {
  label: string;
  value: string;
  helper: string;
  accent?: string;
  progress?: number;
}) {
  const safeProgress = Math.max(12, Math.min(progress ?? 66, 100));

  return (
    <Card className="overflow-hidden border-white/80 bg-gradient-to-br from-white via-white to-emerald-50/40">
      <CardContent className="relative p-6">
        <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: accent ?? "#CCFBF1" }} />
        <div className="absolute right-5 top-5 inline-flex size-10 items-center justify-center rounded-full bg-slate-950/5">
          <ArrowUpRight className="size-4 text-slate-700" />
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</h3>
        <p className="mt-3 text-sm text-slate-500">{helper}</p>
        <div className="mt-6 flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Lectura rápida</span>
          <span>{safeProgress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full" style={{ backgroundColor: accent ?? "#CCFBF1", width: `${safeProgress}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}
