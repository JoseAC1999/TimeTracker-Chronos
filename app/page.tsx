import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, FolderKanban, Sparkles, Timer } from "lucide-react";

export default function Home() {
  const features = [
    { title: "Cronómetro global", description: "Inicia, pausa y detén una sesión enfocada desde cualquier vista.", Icon: Timer },
    { title: "Centro de proyectos", description: "Mantén juntos los proyectos activos, pausados y archivados.", Icon: FolderKanban },
    { title: "Claridad diaria", description: "Ve el tiempo de hoy por proyecto, tarea y categoría.", Icon: Clock3 },
    { title: "Reportes visuales", description: "Revisa tu dedicación semanal y mensual con gráficos claros.", Icon: BarChart3 },
  ];

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 rounded-[36px] border border-white/70 bg-white/80 p-6 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">TimeTracker Chronos</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Controla tu tiempo con una visión clara de tu día.</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/login" className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700">
              Iniciar sesión
            </Link>
            <Link href="/register" className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-medium text-white">
              Empezar gratis
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-10 py-12 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-4 py-2 text-sm font-medium text-teal-700">
              <Sparkles className="size-4" />
              TimeTracker Chronos para profesionales y equipos de una sola persona
            </div>
            <h2 className="mt-8 max-w-4xl text-5xl font-semibold leading-tight tracking-tight text-slate-950 lg:text-7xl">
              Proyectos, tareas y cronómetros conviviendo en un dashboard sereno.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Registra trabajo en vivo, añade sesiones manuales, inspecciona tu timeline y entiende exactamente en qué inviertes tus horas.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-medium text-white">
                Crear workspace
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center rounded-full border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700">
                Probar demo
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {features.map(({ title, description, Icon }) => (
              <div key={title} className="rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.4)]">
                <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
