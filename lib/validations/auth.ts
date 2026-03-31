import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Introduce un correo válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z
    .string()
    .min(10, "La contraseña debe tener al menos 10 caracteres")
    .regex(/[a-z]/, "La contraseña debe incluir una letra minúscula")
    .regex(/[A-Z]/, "La contraseña debe incluir una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe incluir un número"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
