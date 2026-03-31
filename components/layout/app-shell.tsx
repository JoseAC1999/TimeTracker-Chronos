"use client";

import { usePathname } from "next/navigation";

import { ActiveTimerBanner } from "@/components/layout/active-timer-banner";
import { AppHeader } from "@/components/layout/app-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";

function getPageMeta(pathname: string) {
  if (pathname.startsWith("/projects")) {
    return {
      title: "Proyectos",
      description: "Organiza todas tus iniciativas, su estado y el esfuerzo registrado en una sola vista clara.",
    };
  }
  if (pathname.startsWith("/tasks")) {
    return {
      title: "Tareas",
      description: "Mantén la capa accionable de tu trabajo ordenada, priorizada y lista para registrar tiempo.",
    };
  }
  if (pathname.startsWith("/timer")) {
    return {
      title: "Cronómetro",
      description: "Inicia sesiones enfocadas, resuelve conflictos y registra tiempo manualmente cuando lo necesites.",
    };
  }
  if (pathname.startsWith("/sessions")) {
    return {
      title: "Sesiones",
      description: "Inspecciona tu historial detallado de actividad, los huecos del timeline y los ajustes manuales.",
    };
  }
  if (pathname.startsWith("/reports")) {
    return {
      title: "Reportes",
      description: "Revisa tu día, semana y mes a través de proyectos, categorías y tendencias visuales.",
    };
  }
  if (pathname.startsWith("/settings")) {
    return {
      title: "Ajustes",
      description: "Ajusta la base de tu espacio de trabajo y las preferencias de seguimiento diario.",
    };
  }
  return {
    title: "Resumen",
    description: "Un centro de control sereno para tu cronómetro actual, el foco de hoy y el trabajo reciente.",
  };
}

export function AppShell({
  children,
  user,
  activeEntry,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
  activeEntry?: {
    id: string;
    startedAt: Date;
    accumulatedPauseSec: number;
    pausedAt: Date | null;
    project: { name: string; color: string };
    task?: { name: string } | null;
    note?: string | null;
  } | null;
}) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] gap-6 px-4 py-6 pb-28 lg:px-6 xl:pb-6">
      <AppSidebar pathname={pathname} />
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <AppHeader title={meta.title} description={meta.description} user={user} />
        <ActiveTimerBanner entry={activeEntry} />
        <div className="flex-1">{children}</div>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
