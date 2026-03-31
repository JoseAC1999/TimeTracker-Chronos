import {
  BriefcaseBusiness,
  CheckCircle2,
  FolderKanban,
  Hourglass,
  MonitorPlay,
  Rocket,
} from "lucide-react";

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
