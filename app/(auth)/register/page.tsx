import Link from "next/link";

import { RegisterForm } from "@/components/forms/register-form";

export default function RegisterPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">Empieza gratis</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Crea tu espacio en TimeTracker Chronos</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">Configura tu cuenta y empieza a registrar proyectos, tareas y tiempo desde el primer día.</p>
      <div className="mt-10">
        <RegisterForm />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-slate-950">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
