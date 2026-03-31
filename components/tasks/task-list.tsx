import { RotateCcw, Trash2 } from "lucide-react";

import { deleteTaskAction, restoreTaskAction } from "@/app/actions/project-actions";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPriorityLabel, getTaskStatusLabel } from "@/lib/utils/labels";
import type { TaskWithRelations } from "@/types/domain";

export function TaskList({
  tasks,
  projects,
  tags,
  showArchived = false,
}: {
  tasks: TaskWithRelations[];
  projects: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  showArchived?: boolean;
}) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-950">{task.name}</h3>
                  <Badge variant={task.status === "DONE" ? "success" : task.status === "BLOCKED" ? "warning" : "neutral"}>
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                  {task.deletedAt ? <Badge variant="warning">Eliminada</Badge> : null}
                  <Badge variant={task.priority === "URGENT" ? "danger" : task.priority === "HIGH" ? "warning" : "info"}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500">{task.project.name}</p>
                {task.description ? <p className="text-sm leading-6 text-slate-600">{task.description}</p> : null}
                <div className="flex flex-wrap gap-2">
                  {task.taskTags.map(({ tag }) => (
                    <span key={tag.id} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <TaskFormDialog
                  task={{
                    id: task.id,
                    projectId: task.projectId,
                    name: task.name,
                    description: task.description,
                    status: task.status,
                    priority: task.priority,
                    tagIds: task.taskTags.map((item) => item.tag.id),
                  }}
                  projects={projects}
                  tags={tags}
                />
                {showArchived && task.deletedAt ? (
                  <form action={restoreTaskAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <Button type="submit" variant="secondary">
                      <RotateCcw className="size-4" />
                      Restaurar
                    </Button>
                  </form>
                ) : (
                  <form action={deleteTaskAction}>
                    <input type="hidden" name="taskId" value={task.id} />
                    <Button type="submit" variant="ghost">
                      <Trash2 className="size-4" />
                      Eliminar
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
