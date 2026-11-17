import { z } from "zod";

/** Mismo schema en el formulario (cliente) y en la Server Action (servidor). */
export const loginSchema = z.object({
  email: z.email({ error: "Ingresá un email válido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Ingresá tu contraseña." }).max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;
