"use client";

import { useMemo, useState } from "react";
import { Play, Sparkles, Target, TimerReset } from "lucide-react";
import { toast } from "sonner";

import { startTimerAction } from "@/app/actions/time-entry-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TimerLauncher({
  projects,
  tasks,
}: {
  projects: { id: string; name: string }[];
  tasks: { id: string; name: string; projectId: string }[];
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? "");
  const [conflictOpen, setConflictOpen] = useState(false);
  const [pendingData, setPendingData] = useState<FormData | null>(null);

  const filteredTasks = useMemo(() => tasks.filter((task) => task.projectId === selectedProjectId), [selectedProjectId, tasks]);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  async function submitWithStrategy(formData: FormData, strategy: "prompt" | "pause" | "stop") {
    formData.set("conflictStrategy", strategy);
    try {
      await startTimerAction(formData);
      toast.success("Cronómetro iniciado");
      setConflictOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar el cronómetro";
      if (message.includes("already running")) {
        setPendingData(formData);
        setConflictOpen(true);
        return;
      }
      toast.error(message);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Iniciar cronómetro</CardTitle>
        <CardDescription>Elige un proyecto y una tarea para arrancar una sesión enfocada.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <Sparkles className="size-4" />
            <p className="text-sm font-semibold">Preparación del bloque</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Cuanto más claro sea el proyecto y la intención, más útil será después el análisis de tu jornada.
          </p>
        </div>
        <form
          className="space-y-5"
          action={async (formData) => {
            await submitWithStrategy(formData, "prompt");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="projectId">Proyecto</Label>
            <select
              id="projectId"
              name="projectId"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm"
              onChange={(event) => setSelectedProjectId(event.target.value)}
              defaultValue={selectedProjectId}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="taskId">Tarea</Label>
            <select id="taskId" name="taskId" className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm" defaultValue="">
              <option value="">Trabajo general</option>
              {filteredTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Nota</Label>
            <Textarea id="note" name="note" placeholder="Ej. revisar propuestas, preparar presupuesto, depurar integración..." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Target className="size-4" />
                <p className="text-sm font-semibold">Proyecto actual</p>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{selectedProject?.name ?? "Sin proyecto"}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Tareas disponibles</p>
              <p className="mt-2 text-sm text-slate-600">
                {filteredTasks.length ? `${filteredTasks.length} opciones vinculadas a este proyecto.` : "Sin tareas específicas. Se registrará como trabajo general."}
              </p>
            </div>
          </div>
          <Input type="hidden" name="conflictStrategy" value="prompt" readOnly />
          <Button type="submit">
            <Play className="size-4" />
            Iniciar cronómetro
          </Button>
        </form>

        {conflictOpen ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="font-medium text-amber-900">Ya hay un cronómetro activo.</p>
            <p className="mt-2 text-sm text-amber-700">Elige si quieres pausarlo o detenerlo antes de iniciar el nuevo.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (pendingData) void submitWithStrategy(pendingData, "pause");
                }}
              >
                Pausar actual e iniciar nuevo
              </Button>
              <Button
                variant="soft"
                onClick={() => {
                  if (pendingData) void submitWithStrategy(pendingData, "stop");
                }}
              >
                <TimerReset className="size-4" />
                Detener actual e iniciar nuevo
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
