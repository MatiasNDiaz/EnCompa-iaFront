"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { loginSchema, type LoginInput } from "./schemas";

export type LoginResult = { error: string } | undefined;

/** Mensaje único: no revela si el email existe ni cuál de los dos datos falló. */
const GENERIC_ERROR = "Email o contraseña incorrectos.";

export async function loginAction(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: GENERIC_ERROR };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Rate limit de Auth: mensaje propio para que el admin sepa que debe esperar.
    if (error.status === 429) {
      return { error: "Demasiados intentos. Esperá unos minutos y volvé a probar." };
    }
    return { error: GENERIC_ERROR };
  }

  // El layout protegido decide si el usuario es admin o ve "acceso denegado".
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
