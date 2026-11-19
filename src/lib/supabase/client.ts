import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";

import { supabaseEnv } from "./env";

/**
 * Cliente de navegador SIN sesión. Solo lo usa el panel para subir archivos a Storage
 * con una URL FIRMADA (el permiso viaja en el token de la URL, no en la sesión).
 * La cookie de sesión es httpOnly: el navegador no la lee ni la necesita (ver ./cookies.ts).
 */
export function createClient() {
  return createSupabaseClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
