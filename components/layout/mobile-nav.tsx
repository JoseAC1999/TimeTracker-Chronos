"use client";

import Link from "next/link";
import { BarChart3, FolderKanban, Gauge, Timer, Workflow } from "lucide-react";

import { cn } from "@/lib/utils/cn";

const items = [
  { href: "/dashboard", label: "Resumen", icon: Gauge },
  { href: "/projects", label: "Proyectos", icon: FolderKanban },
  { href: "/tasks", label: "Tareas", icon: Workflow },
  { href: "/timer", label: "Timer", icon: Timer },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
];

export function MobileNav({ pathname }: { pathname: string }) {
  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 xl:hidden">
      <div className="grid grid-cols-5 rounded-[28px] border border-white/70 bg-white/90 p-2 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition",
                active ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
