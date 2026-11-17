import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";
import type { Tables } from "@/types/database.types";

export type TrainingImage = Tables<"training_images">;
export type Training = Tables<"trainings"> & { training_images: TrainingImage[] };

/** Capacitaciones publicadas con sus fotos ordenadas (una sola consulta con embed). */
export const getTrainings = cache(async (): Promise<Training[]> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.trainings])
    .from("trainings")
    .select("*, training_images(*)")
    .order("sort_order")
    .order("sort_order", { referencedTable: "training_images" });

  if (error) throw new QueryError("las capacitaciones", error);
  return data;
});
