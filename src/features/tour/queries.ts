import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";
import type { Tables } from "@/types/database.types";

/** Los 4 ambientes del cliente (CLAUDE.md §4 · 02), en orden, con título y descripción oficiales. */
export const TOUR_AREAS = [
  { key: "salon", title: "El salón", description: "Mesas, espacios y ambientación." },
  { key: "barra", title: "La barra", description: "Cafetería, preparación y detalles." },
  {
    key: "rincones",
    title: "Nuestros rincones",
    description: "Sectores especiales del establecimiento.",
  },
  {
    key: "detalles",
    title: "Los detalles",
    description: "Decoración, iluminación y elementos que construyen la identidad.",
  },
] as const;

export type TourAreaKey = (typeof TOUR_AREAS)[number]["key"];
export type TourImage = Tables<"tour_images">;

export type TourArea = (typeof TOUR_AREAS)[number] & { images: TourImage[] };

/** Recorrido agrupado por ambiente (siempre los 4, aunque alguno esté vacío). */
export const getTour = cache(async (): Promise<TourArea[]> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.tour])
    .from("tour_images")
    .select("*")
    .order("sort_order")
    .order("created_at");

  if (error) throw new QueryError("el recorrido", error);

  return TOUR_AREAS.map((area) => ({
    ...area,
    images: data.filter((image) => image.area === area.key),
  }));
});
