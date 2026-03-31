import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Detalles base del espacio sobre el que este MVP está preparado para escalar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Nombre</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{user.workspace?.name}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Propietario</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{user.name ?? user.email}</p>
          </div>
          <Badge variant="info">Modelo preparado para multi-workspace</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias de seguimiento</CardTitle>
          <CardDescription>Ajustes actuales guardados para futuras opciones del usuario.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Zona horaria</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{user.settings?.timezone ?? "Europe/Madrid"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Inicio del día</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{`${user.settings?.dayStartHour ?? 8}:00`}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Inicio de semana</p>
            <p className="mt-2 text-lg font-semibold text-slate-950">{user.settings?.weekStartsOn === 0 ? "Domingo" : "Lunes"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
