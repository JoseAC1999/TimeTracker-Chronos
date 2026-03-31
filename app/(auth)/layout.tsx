export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden rounded-[36px] bg-slate-950 p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-teal-300">TimeTracker Chronos</p>
            <h1 className="mt-6 text-5xl font-semibold leading-tight">Controla lo importante sin pelearte con tu herramienta.</h1>
            <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
              Construye un registro claro de tu día con un único espacio para proyectos, tareas, sesiones y reportes visuales.
            </p>
          </div>
          <div className="rounded-[28px] bg-white/10 p-6">
            <p className="text-sm text-slate-300">Pensado para founders, diseñadores, developers y cualquiera que quiera más visibilidad sobre su trabajo real.</p>
          </div>
        </section>
        <section className="rounded-[36px] border border-white/70 bg-white/90 p-8 shadow-[0_32px_100px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-10">
          {children}
        </section>
      </div>
    </main>
  );
}
