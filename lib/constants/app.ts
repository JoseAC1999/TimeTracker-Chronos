import {
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  Hourglass,
  MonitorPlay,
  Rocket,
} from "lucide-react";

// Work schedule targets (in seconds)
export const DAILY_TARGET_SECONDS = 8 * 60 * 60; // 8 hours
export const WEEKLY_TARGET_SECONDS = 40 * 60 * 60; // 40 hours

// Progress bar scale factors
export const SESSIONS_PROGRESS_SCALE = 16;
export const PROJECTS_PROGRESS_SCALE = 14;
export const CATEGORIES_PROGRESS_SCALE = 20;
export const REPORT_SESSIONS_PROGRESS_SCALE = 8;

export const projectIcons = {
  "briefcase-business": BriefcaseBusiness,
  "check-circle-2": CheckCircle2,
  "folder-kanban": FolderKanban,
  hourglass: Hourglass,
  "monitor-play": MonitorPlay,
  rocket: Rocket,
};

export const projectColorOptions = [
  "#0F766E",
  "#2563EB",
  "#D97706",
  "#E11D48",
  "#7C3AED",
  "#0891B2",
];

export const dashboardLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/timer", label: "Timer" },
  { href: "/sessions", label: "Sessions" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];
