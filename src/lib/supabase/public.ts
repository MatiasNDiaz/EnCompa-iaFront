import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { CacheTag } from "@/lib/cache/tags";

import { supabaseEnv } from "./env";

/**
 * Cliente de servidor SIN cookies para las lecturas de la web pública.
 *
 * Por qué: el cliente con cookies obliga a renderizar cada página en cada request.
 * El contenido público es igual para todos los visitantes (rol `anon`), así que se
 * puede prerenderizar y cachear. Cada fetch se etiqueta con `tags`: cuando el admin
 * edita algo, la Server Action llama a `updateTag(tag)` y solo se regenera lo afectado.
 *
 * Seguridad: usa la clave publishable sin sesión → siempre rol `anon` → la RLS solo
 * devuelve contenido publicado/activo.
 */
export function createPublicClient(tags: readonly CacheTag[]) {
  return createClient<Database>(supabaseEnv.url, supabaseEnv.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          // En desarrollo, siempre datos frescos: la caché de fetch del dev server
          // sobrevive a un `db reset` y mezclaría datos viejos con nuevos.
          cache: IS_DEV ? "no-store" : "force-cache",
          next: { tags: [...tags] },
        }),
    },
  });
}

const IS_DEV = process.env.NODE_ENV === "development";
