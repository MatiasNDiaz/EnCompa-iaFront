import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AdminStatus =
  | { status: "anonymous" }
  | { status: "forbidden"; userId: string }
  | { status: "admin"; userId: string; email: string | null; fullName: string | null };

/**
 * Estado de autorización del request actual, verificado en el servidor.
 *
 * - Identidad: `getClaims()` valida la firma del JWT (nunca `getSession()`, que solo
 *   lee la cookie sin verificarla).
 * - Rol: `private.is_admin()` no se expone por la API, así que se lee el perfil propio
 *   desde `profiles`. La RLS solo deja ver el perfil del propio usuario y nadie puede
 *   escribir `profiles` desde la API, así que el rol no se puede falsificar.
 *
 * `cache()` deduplica la verificación dentro del mismo request (layout + página).
 */
export const getAdminStatus = cache(async (): Promise<AdminStatus> => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) return { status: "anonymous" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.role !== "admin") return { status: "forbidden", userId };

  const email = typeof claimsData.claims.email === "string" ? claimsData.claims.email : null;
  return { status: "admin", userId, email, fullName: profile.full_name };
});

export class UnauthorizedError extends Error {
  constructor() {
    super("No autorizado.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Para CADA Server Action de escritura del CMS: verifica sesión y rol admin y devuelve
 * el cliente con la sesión del usuario (la RLS vuelve a verificar en la base).
 * Lanza `UnauthorizedError` si no corresponde.
 */
export async function requireAdmin() {
  const auth = await getAdminStatus();
  if (auth.status !== "admin") throw new UnauthorizedError();

  const supabase = await createClient();
  return { supabase, userId: auth.userId, email: auth.email };
}
