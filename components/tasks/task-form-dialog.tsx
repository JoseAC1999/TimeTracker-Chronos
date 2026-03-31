"use client";

import { useState } from "react";
import { ListTodo } from "lucide-react";

import { upsertTaskAction } from "@/app/actions/project-actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TaskFormDialog({
  projects,
  tags,
  task,
  defaultProjectId,
}: {
  projects: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  defaultProjectId?: string;
  task?: {
    id: string;
    projectId: string;
    name: string;
    description: string | null;
    status: string;
    priority: string;
    tagIds: string[];
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={task ? "secondary" : "default"}>
          <ListTodo className="size-4" />
          {task ? "Editar tarea" : "Nueva tarea"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Crear tarea"}</DialogTitle>
          <DialogDescription>Organiza trabajo accionable dentro de tus proyectos.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await upsertTaskAction(formData);
            setOpen(false);
          }}
          className="space-y-5"
        >
          <input name="id" type="hidden" defaultValue={task?.id} />
          <div className="space-y-2">
            <Label htmlFor="task-project">Proyecto</Label>
            <select
              id="task-project"
              name="projectId"
              defaultValue={task?.projectId ?? defaultProjectId}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-name">Nombre de la tarea</Label>
            <Input id="task-name" name="name" defaultValue={task?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Descripción</Label>
            <Textarea id="task-description" name="description" defaultValue={task?.description ?? ""} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-status">Estado</Label>
              <select id="task-status" name="status" defaultValue={task?.status ?? "TODO"} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
                <option value="TODO">Por hacer</option>
                <option value="IN_PROGRESS">En curso</option>
                <option value="BLOCKED">Bloqueada</option>
                <option value="DONE">Hecha</option>
                <option value="ARCHIVED">Archivada</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Prioridad</Label>
              <select id="task-priority" name="priority" defaultValue={task?.priority ?? "MEDIUM"} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Etiquetas</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <label key={tag.id} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  <input type="checkbox" name="tagIds" value={tag.id} defaultChecked={task?.tagIds.includes(tag.id)} />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <SubmitButton type="submit">{task ? "Guardar cambios" : "Crear tarea"}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
