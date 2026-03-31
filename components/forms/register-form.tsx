"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { registerUser } from "@/app/actions/auth-actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = { error: "" };

export function RegisterForm() {
  const [state, action] = useActionState(registerUser, initialState);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <form action={action} className="space-y-5">
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
