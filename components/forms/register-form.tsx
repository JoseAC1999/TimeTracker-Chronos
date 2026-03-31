"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerUser } from "@/app/actions/auth-actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: "", success: false };

export function RegisterForm() {
  const router = useRouter();
  const [state, action] = useActionState(registerUser, initialState);
  const [submittedCredentials, setSubmittedCredentials] = useState<{ email: string; password: string } | null>(null);
  const hasAutoSignedIn = useRef(false);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  useEffect(() => {
    if (!state.success || !submittedCredentials || hasAutoSignedIn.current) {
      return;
    }

    hasAutoSignedIn.current = true;

    void (async () => {
      const result = await signIn("credentials", {
        email: submittedCredentials.email,
        password: submittedCredentials.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("La cuenta se creó, pero no se pudo iniciar sesión automáticamente.");
        router.push("/login");
        return;
      }

      toast.success("Cuenta creada. ¡Bienvenido!");
      router.push("/dashboard");
      router.refresh();
    })();
  }, [router, state.success, submittedCredentials]);

  return (
    <form
      action={action}
      className="space-y-5"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        setSubmittedCredentials({
          email: String(formData.get("email") ?? "").toLowerCase(),
          password: String(formData.get("password") ?? ""),
        });
        hasAutoSignedIn.current = false;
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" placeholder="Jose Ascanio" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input id="email" name="email" type="email" placeholder="tu@empresa.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" name="password" type="password" placeholder="Mínimo 10 caracteres, con mayúscula y número" required />
      </div>
      <FormMessage message={state.error} />
      <SubmitButton className="w-full" type="submit">
        Crear cuenta
      </SubmitButton>
    </form>
  );
}
