import type {
  Project,
  ProjectStatus,
  Tag,
  Task,
  TaskPriority,
  TaskStatus,
  TimeEntry,
  User,
  UserSetting,
  Workspace,
} from "@prisma/client";

export type AppUser = User & {
  workspace: Workspace;
  settings: UserSetting | null;
};

export type ProjectWithMeta = Project & {
  _count: {
    tasks: number;
    timeEntries: number;
  };
};

export type TaskWithRelations = Task & {
  project: Project;
  taskTags: {
    tag: Tag;
  }[];
};

export type TimeEntryWithRelations = TimeEntry & {
  project: Project;
  task: Task | null;
  entryTags: {
    tag: Tag;
  }[];
};

export type TaskStatusValue = `${TaskStatus}`;
export type TaskPriorityValue = `${TaskPriority}`;
export type ProjectStatusValue = `${ProjectStatus}`;
