import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";

import { openingExceptionSchema, type OpeningException } from "./schemas";

/**
 * Días especiales de hoy en adelante (la RLS ya filtra los pasados, en hora de Córdoba).
 * Con caché por tag: si un día pasa y la caché todavía lo trae, quien los muestra filtra
 * por fecha. Filas inválidas se descartan.
 */
export const getOpeningExceptions = cache(async (): Promise<OpeningException[]> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.hours])
    .from("opening_exceptions")
    .select("id, date, type, ranges, note")
    .order("date")
    .limit(120);

  if (error) throw new QueryError("los días especiales", error);
  return data.flatMap((row) => {
    const parsed = openingExceptionSchema.safeParse(row);
    return parsed.success ? [parsed.data] : [];
  });
});
