import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";
import type { Tables } from "@/types/database.types";

/** Categorías de la galería (CHECK de la base) con su etiqueta visible. */
export const GALLERY_CATEGORIES = [
  { key: "espacio", label: "Espacio" },
  { key: "cafe", label: "Café" },
  { key: "tapas", label: "Tapeo" },
  { key: "cocktails", label: "Cocktails" },
  { key: "equipo", label: "Equipo" },
  { key: "momentos", label: "Momentos" },
] as const;

export type GalleryItem = Tables<"gallery_items">;

/** Ítems publicados (la RLS ya filtra los borradores). */
export const getGalleryItems = cache(async (): Promise<GalleryItem[]> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.gallery])
    .from("gallery_items")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) throw new QueryError("la galería", error);
  return data;
});
