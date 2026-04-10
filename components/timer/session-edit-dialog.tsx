"use client";

import { useRouter } from "next/navigation";

import { ManualEntryDialog } from "@/components/timer/manual-entry-form";

export function SessionEditDialog({
  projects,
  tasks,
  tags,
  entry,
  returnHref,
}: {
  projects: { id: string; name: string }[];
  tasks: { id: string; name: string; projectId: string }[];
  tags: { id: string; name: string }[];
  entry: {
    id: string;
    projectId: string;
    taskId?: string | null;
    startedAt: string;
    endedAt: string;
    note?: string | null;
    tagIds: string[];
  };
  returnHref: string;
}) {
  const router = useRouter();

  return (
    <ManualEntryDialog
      projects={projects}
      tasks={tasks}
      tags={tags}
      entry={entry}
      open
      onOpenChange={(open) => {
        if (!open) {
          router.replace(returnHref);
        }
      }}
    />
  );
}
