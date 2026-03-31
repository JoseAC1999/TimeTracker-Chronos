"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Tags, Timer } from "lucide-react";
import { toast } from "sonner";

import { saveManualEntryAction } from "@/app/actions/time-entry-actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ManualEntryForm({
  projects,
  tasks,
  tags,
  entry,
}: {
  projects: { id: string; name: string }[];
  tasks: { id: string; name: string; projectId: string }[];
  tags: { id: string; name: string }[];
  entry?: {
    id: string;
    projectId: string;
    taskId?: string | null;
    startedAt: string;
    endedAt: string;
    note?: string | null;
    tagIds: string[];
  };
}) {
  const [open, setOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(entry?.projectId ?? projects[0]?.id ?? "");
  const filteredTasks = useMemo(() => tasks.filter((task) => task.projectId === selectedProjectId), [selectedProjectId, tasks]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={entry ? "secondary" : "default"}>
          <CalendarClock className="size-4" />
          {entry ? "Editar sesión" : "Registrar tiempo manualmente"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? "Editar entrada de tiempo" : "Crear entrada manual"}</DialogTitle>
          <DialogDescription>Corrige una sesión o registra tiempo que trabajaste fuera del cronómetro.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            try {
              await saveManualEntryAction(formData);
              toast.success(entry ? "Sesión actualizada" : "Sesión creada");
              setOpen(false);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "No se pudo guardar la sesión");
            }
          }}
          className="space-y-5"
        >
          <input name="id" type="hidden" defaultValue={entry?.id} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="manual-project">Proyecto</Label>
              <select
                id="manual-project"
                name="projectId"
                defaultValue={entry?.projectId ?? projects[0]?.id}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm"
                onChange={(event) => setSelectedProjectId(event.target.value)}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="manual-task">Tarea</Label>
              <select id="manual-task" name="taskId" defaultValue={entry?.taskId ?? ""} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
                <option value="">Trabajo general</option>
                {filteredTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Timer className="size-4" />
                <p className="text-sm font-semibold">Contexto</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">Registra bloques terminados para mantener el día completo.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Tareas filtradas</p>
              <p className="mt-2 text-sm text-slate-600">{filteredTasks.length} opciones para el proyecto elegido.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Tags className="size-4" />
                <p className="text-sm font-semibold">Etiquetas</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">Sirven para explicar mejor qué tipo de trabajo fue.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startedAt">Inicio</Label>
              <Input id="startedAt" name="startedAt" type="datetime-local" defaultValue={entry?.startedAt} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endedAt">Fin</Label>
              <Input id="endedAt" name="endedAt" type="datetime-local" defaultValue={entry?.endedAt} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manual-note">Nota</Label>
            <Textarea id="manual-note" name="note" defaultValue={entry?.note ?? ""} />
          </div>
          <div className="space-y-3">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" name="tagIds" value={tag.id} defaultChecked={entry?.tagIds.includes(tag.id)} />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <SubmitButton type="submit">{entry ? "Guardar cambios" : "Crear entrada"}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
