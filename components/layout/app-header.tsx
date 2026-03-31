import { BellDot, Search, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/layout/user-menu";

export function AppHeader({
  title,
  description,
  user,
}: {
  title: string;
  description: string;
  user: { name?: string | null; email?: string | null };
}) {
  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          <Sparkles className="size-3.5" />
          TimeTracker Chronos
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative min-w-72">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-11" placeholder="Buscar proyectos, tareas o notas..." />
        </div>
        <button className="inline-flex size-11 items-center justify-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50">
          <BellDot className="size-5" />
        </button>
        <UserMenu name={user.name} email={user.email} />
      </div>
    </header>
  );
}
