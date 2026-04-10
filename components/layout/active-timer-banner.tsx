"use client";

import { Pause, Play, Square } from "lucide-react";
import { toast } from "sonner";

import { pauseTimerAction, resumeTimerAction, stopTimerAction } from "@/app/actions/time-entry-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLiveDuration } from "@/hooks/use-live-duration";
import { formatDurationClock, formatDurationLong } from "@/lib/utils/time";

export function ActiveTimerBanner({
  entry,
}: {
  entry?: {
    id: string;
    startedAt: Date;
    accumulatedPauseSec: number;
    pausedAt: Date | null;
    project: { name: string; color: string };
    task?: { name: string } | null;
    note?: string | null;
  } | null;
}) {
  const liveDuration = useLiveDuration(entry?.startedAt, entry?.accumulatedPauseSec ?? 0, Boolean(entry?.pausedAt));

  if (!entry) return null;

  return (
    <Card className="border-none bg-slate-950 text-white">
      <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-300">Cronómetro activo</p>
          <h3 className="text-3xl font-semibold tabular-nums">{formatDurationClock(liveDuration)}</h3>
          <p className="text-sm text-slate-400">{formatDurationLong(liveDuration)}</p>
          <p className="text-sm text-slate-300">
            {entry.project.name}
            {entry.task ? ` · ${entry.task.name}` : ""}
          </p>
          {entry.note ? <p className="text-sm text-slate-400">{entry.note}</p> : null}
        </div>
        <div className="flex flex-wrap gap-3">
          <form
            action={async () => {
              const formData = new FormData();
              formData.set("entryId", entry.id);
              try {
                if (entry.pausedAt) {
                  await resumeTimerAction(formData);
                  toast.success("Cronómetro reanudado");
                } else {
                  await pauseTimerAction(formData);
                  toast.success("Cronómetro pausado");
                }
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "No se pudo actualizar el cronómetro");
              }
            }}
          >
            <Button type="submit" variant="secondary">
              {entry.pausedAt ? <Play className="size-4" /> : <Pause className="size-4" />}
              {entry.pausedAt ? "Reanudar" : "Pausar"}
            </Button>
          </form>
          <form
            action={async () => {
              const formData = new FormData();
              formData.set("entryId", entry.id);
              try {
                await stopTimerAction(formData);
                toast.success("Cronómetro detenido");
              } catch (error) {
                toast.error(error instanceof Error ? error.message : "No se pudo detener el cronómetro");
              }
            }}
          >
            <Button type="submit" variant="soft">
              <Square className="size-4" />
              Detener cronómetro
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
