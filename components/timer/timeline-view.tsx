import { AlertTriangle, MoonStar } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDurationLong, formatDurationShort, formatTimeRange } from "@/lib/utils/time";
import type { TimeEntryWithRelations } from "@/types/domain";

export function TimelineView({ entries }: { entries: TimeEntryWithRelations[] }) {
  const sortedEntries = [...entries].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  const totalTracked = sortedEntries.reduce((sum, entry) => sum + entry.durationSec, 0);
  const overlapCount = sortedEntries.reduce((count, entry, index) => {
    const previous = sortedEntries[index - 1];
    return count + (previous?.endedAt ? Number(previous.endedAt > entry.startedAt) : 0);
  }, 0);

  const items = sortedEntries.map((entry, index) => {
    const previous = sortedEntries[index - 1];
    const hasOverlap = previous?.endedAt ? previous.endedAt > entry.startedAt : false;
    const gapMinutes = previous?.endedAt ? Math.round((entry.startedAt.getTime() - previous.endedAt.getTime()) / 60000) : 0;

    return { entry, hasOverlap, gapMinutes };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline diario</CardTitle>
        <CardDescription>Visualiza tus sesiones como bloques y detecta huecos o solapamientos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sesiones</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{sortedEntries.length}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tiempo trazado</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{formatDurationLong(totalTracked)}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Alertas</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{overlapCount}</p>
          </div>
        </div>
        {items.map(({ entry, hasOverlap, gapMinutes }) => (
          <div key={entry.id} className="rounded-3xl border border-slate-100 bg-white/70 p-4">
            {gapMinutes > 15 ? (
              <div className="mb-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                <MoonStar className="size-3.5" />
                Hueco detectado: {gapMinutes} min entre sesiones
              </div>
            ) : null}
            {hasOverlap ? (
              <div className="mb-3 flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                <AlertTriangle className="size-3.5" />
                Solapamiento detectado
              </div>
            ) : null}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-950">{entry.task?.name ?? entry.project.name}</p>
                <p className="text-sm text-slate-500">{entry.project.name}</p>
                <p className="mt-2 text-sm text-slate-600">{formatTimeRange(entry.startedAt, entry.endedAt)}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {formatDurationShort(entry.durationSec)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
