import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.types";

import { supabaseEnv } from "./env";

/**
 * Cliente de navegador (Client Components). Usa la sesión guardada en cookies.
 * Lo usa el CMS para subir archivos directo a Storage con la sesión del admin.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey);
}
