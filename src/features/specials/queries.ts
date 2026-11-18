import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { getMediaUrl } from "@/lib/storage/media";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";

import { SPECIAL_MOMENTS, type DailySpecial } from "./moments";

/**
 * Platos del día PUBLICADOS (la RLS no entrega los demás), en orden mañana → noche.
 * Lectura pública cacheada con el tag `specials`: el panel lo invalida al guardar.
 */
export const getPublishedSpecials = cache(async (): Promise<DailySpecial[]> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.specials])
    .from("daily_specials")
    .select("moment, title, subtitle, body, price, ingredients, image_path");

  if (error) throw new QueryError("el plato del día", error);

  return data
    .filter((row) => row.title && row.image_path) // la base ya lo garantiza al publicar
    .map((row) => ({
      moment: row.moment,
      title: row.title!,
      subtitle: row.subtitle,
      body: row.body,
      price: row.price,
      ingredients: row.ingredients,
      imageUrl: getMediaUrl(row.image_path),
    }))
    .sort((a, b) => SPECIAL_MOMENTS.indexOf(a.moment) - SPECIAL_MOMENTS.indexOf(b.moment));
});
