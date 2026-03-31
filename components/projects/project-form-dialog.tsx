"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";

import { upsertProjectAction } from "@/app/actions/project-actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { projectColorOptions } from "@/lib/constants/app";

export function ProjectFormDialog({
  project,
}: {
  project?: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    status: string;
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={project ? "secondary" : "default"}>
          <FolderPlus className="size-4" />
          {project ? "Editar proyecto" : "Nuevo proyecto"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{project ? "Editar proyecto" : "Crear proyecto"}</DialogTitle>
          <DialogDescription>Define una identidad visual clara con color, estado y foco.</DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            await upsertProjectAction(formData);
            setOpen(false);
          }}
          className="space-y-5"
        >
          <input name="id" type="hidden" defaultValue={project?.id} />
          <div className="space-y-2">
            <Label htmlFor="project-name">Nombre del proyecto</Label>
            <Input id="project-name" name="name" defaultValue={project?.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Descripción</Label>
            <Textarea id="project-description" name="description" defaultValue={project?.description ?? ""} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project-color">Color</Label>
              <div className="flex flex-wrap gap-2">
                {projectColorOptions.map((color) => (
                  <label key={color} className="cursor-pointer">
                    <input className="sr-only" type="radio" name="color" value={color} defaultChecked={(project?.color ?? "#0F766E") === color} />
                    <span className="block size-9 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: color }} />
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-status">Estado</Label>
              <select
                id="project-status"
                name="status"
                defaultValue={project?.status ?? "ACTIVE"}
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm"
              >
                <option value="ACTIVE">Activo</option>
                <option value="ON_HOLD">En pausa</option>
                <option value="COMPLETED">Completado</option>
                <option value="ARCHIVED">Archivado</option>
              </select>
            </div>
          </div>
          <input name="icon" type="hidden" value={project?.icon ?? "folder-kanban"} />
          <div className="flex justify-end">
            <SubmitButton type="submit">{project ? "Guardar cambios" : "Crear proyecto"}</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
