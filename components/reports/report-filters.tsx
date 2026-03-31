import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReportFilters({
  range,
  projects,
  tasks,
  tags,
  selectedProjectId,
  selectedTaskId,
  selectedTagId,
}: {
  range: string;
  projects: { id: string; name: string }[];
  tasks: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  selectedProjectId?: string;
  selectedTaskId?: string;
  selectedTagId?: string;
}) {
  return (
    <Card className="border-white/80 bg-white/78">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Filter className="size-4" />
          <p className="text-sm font-semibold">Filtra el periodo y reduce ruido antes de leer los gráficos.</p>
        </div>
        <form className="grid gap-4 lg:grid-cols-4">
          <select name="range" defaultValue={range} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
            <option value="day">Este día</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
          <select name="projectId" defaultValue={selectedProjectId ?? ""} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
            <option value="">Todos los proyectos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select name="taskId" defaultValue={selectedTaskId ?? ""} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
            <option value="">Todas las tareas</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          <select name="tagId" defaultValue={selectedTagId ?? ""} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm shadow-sm">
            <option value="">Todas las etiquetas</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-3">
            <Button type="submit">Aplicar filtros</Button>
            <Button asChild variant="ghost">
              <Link href="/reports">
                <RotateCcw className="size-4" />
                Restablecer
              </Link>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
