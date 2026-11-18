import { z } from "zod";

/** Mismo schema en el formulario (cliente) y en la Server Action (servidor). */
export const loginSchema = z.object({
  email: z.email({ error: "Ingresá un email válido." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "Ingresá tu contraseña." }).max(200),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Misma regla que Supabase Auth (config.toml: minimum_password_length = 12,
 * password_requirements = lower_upper_letters_digits) y que scripts/create-admin.mjs.
 * 72 bytes es el máximo que admite bcrypt.
 */
export const PASSWORD_HINT = "Al menos 12 caracteres, con mayúsculas, minúsculas y números.";

const newPassword = z
  .string()
  .min(12, { error: "Tiene que tener al menos 12 caracteres." })
  .max(72, { error: "Es demasiado larga (máximo 72 caracteres)." })
  .regex(/[a-z]/, { error: "Sumá al menos una letra minúscula." })
  .regex(/[A-Z]/, { error: "Sumá al menos una letra mayúscula." })
  .regex(/\d/, { error: "Sumá al menos un número." });

export const passwordChangeSchema = z
  .object({
    current: z.string().min(1, { error: "Ingresá tu contraseña actual." }).max(200),
    next: newPassword,
    confirm: z.string(),
  })
  .refine((data) => data.next === data.confirm, {
    path: ["confirm"],
    error: "Las contraseñas no coinciden.",
  })
  .refine((data) => data.next !== data.current, {
    path: ["next"],
    error: "Tiene que ser distinta de la actual.",
  });

export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
