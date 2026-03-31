import Link from "next/link";
import { BarChart3, FolderKanban, Gauge, History, Settings, Timer, Workflow } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Resumen", icon: Gauge },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/tasks", label: "Tareas", icon: Workflow },
  { href: "/timer", label: "Cronómetro", icon: Timer },
  { href: "/sessions", label: "Sesiones", icon: History },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
  { href: "/settings", label: "Ajustes", icon: Settings },
];

export function AppSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-6 rounded-[32px] border border-white/60 bg-slate-950 p-6 text-white shadow-2xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-300">TimeTracker Chronos</p>
          <h1 className="mt-3 text-2xl font-semibold">Un control de tiempo que se siente ligero.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Proyectos, cronómetro, sesiones y reportes en un espacio de trabajo enfocado.
          </p>
        </div>
        <nav className="space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                  active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
