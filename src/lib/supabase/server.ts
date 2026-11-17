import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database.types";

import { supabaseEnv } from "./env";

/**
 * Cliente de servidor CON la sesión del usuario (cookies). Para el área /admin,
 * Server Actions y todo lo que dependa de quién está logueado.
 * Crear uno nuevo por request (nunca reutilizarlo entre requests).
 *
 * Leer cookies vuelve dinámica la ruta: por eso la web pública NO usa este cliente
 * (ver ./public.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: no puede escribir cookies.
          // No es un problema porque el proxy ya refresca la sesión en cada request.
        }
      },
    },
  });
}
