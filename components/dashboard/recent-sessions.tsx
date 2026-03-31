import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDurationShort, formatTimeRange } from "@/lib/utils/time";
import type { TimeEntryWithRelations } from "@/types/domain";

export function RecentSessions({ entries }: { entries: TimeEntryWithRelations[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimas sesiones</CardTitle>
        <CardDescription>Tu trabajo registrado más reciente a través de todos los proyectos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-3 rounded-3xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-slate-900">{entry.task?.name ?? entry.project.name}</p>
              <p className="text-sm text-slate-500">
                {entry.project.name} · {formatTimeRange(entry.startedAt, entry.endedAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info">{formatDurationShort(entry.durationSec)}</Badge>
              {entry.note ? <span className="max-w-xs truncate text-sm text-slate-500">{entry.note}</span> : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
