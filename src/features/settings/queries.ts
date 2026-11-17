import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";
import type { Tables } from "@/types/database.types";

import { openingHoursSchema, type OpeningHours } from "./schemas";

export type SiteSettings = Omit<Tables<"site_settings">, "opening_hours"> & {
  opening_hours: OpeningHours | null;
};

/** Configuración general (fila única). Horarios inválidos se tratan como "no cargados". */
export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.settings])
    .from("site_settings")
    .select("*")
    .maybeSingle();

  if (error) throw new QueryError("la configuración del sitio", error);
  if (!data) return null;

  const hours = openingHoursSchema.safeParse(data.opening_hours);
  return { ...data, opening_hours: hours.success ? hours.data : null };
});
