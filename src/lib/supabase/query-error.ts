import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Error de lectura pública. Se lanza para que lo capture el `error.tsx` de la ruta:
 * una página no debe renderizarse "vacía" si la base falló (se confundiría con
 * contenido inexistente). El mensaje técnico queda en el log del servidor.
 */
export class QueryError extends Error {
  constructor(context: string, cause: PostgrestError) {
    super(`No se pudo leer ${context}: ${cause.message}`, { cause });
    this.name = "QueryError";
  }
}
