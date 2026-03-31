import Link from "next/link";

import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">Bienvenido de vuelta</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">Entra en tu espacio de trabajo</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">Usa tu email y contraseña para continuar donde lo dejaste.</p>
      <div className="mt-10">
        <LoginForm />
      </div>
      <p className="mt-6 text-sm text-slate-500">
        ¿Necesitas una cuenta?{" "}
        <Link href="/register" className="font-semibold text-slate-950">
          Crear cuenta
        </Link>
      </p>
    </div>
  );
}
