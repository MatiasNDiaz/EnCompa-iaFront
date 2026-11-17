import { createClient } from "@supabase/supabase-js";

import { supabaseEnv } from "@/lib/supabase/env";

export const MEDIA_BUCKET = "site-media";

// Cliente sin sesión: getPublicUrl() solo arma la URL con el SDK, no hace requests.
const storage = createClient(supabaseEnv.url, supabaseEnv.publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false },
}).storage.from(MEDIA_BUCKET);

/**
 * URL pública de un archivo del bucket `site-media` a partir del path guardado en la base.
 * Tolera paths nulos o vacíos: devuelve `null` y la UI muestra el placeholder.
 */
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return storage.getPublicUrl(path).data.publicUrl;
}
