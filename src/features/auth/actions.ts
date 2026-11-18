"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/admin";
import { supabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

import {
  loginSchema,
  PASSWORD_HINT,
  passwordChangeSchema,
  type LoginInput,
  type PasswordChangeInput,
} from "./schemas";

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

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Cambio de contraseña del admin (Mi cuenta).
 * 1. requireAdmin(): sesión verificada y rol admin.
 * 2. Verifica la contraseña ACTUAL con un cliente sin cookies ni persistencia (no toca la
 *    sesión del navegador) y cierra enseguida esa sesión de verificación (scope local).
 * 3. Cambia la contraseña con la sesión del usuario y cierra las sesiones de otros
 *    dispositivos: si alguien más tenía acceso, lo pierde.
 */
export async function changePasswordAction(input: PasswordChangeInput): Promise<ActionResult> {
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisá los datos." };
  }

  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Tu sesión terminó. Volvé a ingresar." };
  }
  if (!session.email) return { ok: false, error: "No pudimos verificar tu cuenta." };

  const verifier = createSupabaseClient(supabaseEnv.url, supabaseEnv.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const check = await verifier.auth.signInWithPassword({
    email: session.email,
    password: parsed.data.current,
  });
  if (check.error) {
    if (check.error.status === 429) {
      return { ok: false, error: "Demasiados intentos. Esperá unos minutos y volvé a probar." };
    }
    return { ok: false, error: "La contraseña actual no es correcta." };
  }
  await verifier.auth.signOut({ scope: "local" });

  const { error } = await session.supabase.auth.updateUser({ password: parsed.data.next });
  if (error) {
    if (error.code === "same_password") {
      return { ok: false, error: "La nueva contraseña tiene que ser distinta de la actual." };
    }
    if (error.code === "weak_password") return { ok: false, error: PASSWORD_HINT };
    return { ok: false, error: "No pudimos cambiar la contraseña. Probá de nuevo." };
  }

  await session.supabase.auth.signOut({ scope: "others" });
  return { ok: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
