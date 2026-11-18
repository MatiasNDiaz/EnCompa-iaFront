import "server-only";

import { cache } from "react";

import { SPECIAL_MOMENTS } from "@/features/specials/moments";
import { requireAdmin } from "@/lib/auth/admin";
import { getMediaUrl } from "@/lib/storage/media";
import { QueryError } from "@/lib/supabase/query-error";

import type { AdminSpecial } from "./types";

/**
 * Los 3 espacios del plato del día con la sesión del admin (la RLS le deja ver también
 * los no publicados). Sin caché: siempre el estado real.
 */
export const getAdminSpecials = cache(async (): Promise<AdminSpecial[]> => {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("daily_specials")
    .select(
      "moment, image_path, title, subtitle, body, price, ingredients, is_published, updated_at",
    );

  if (error) throw new QueryError("el plato del día", error);

  return data
    .map((row) => ({
      moment: row.moment,
      imagePath: row.image_path,
      imageUrl: getMediaUrl(row.image_path),
      title: row.title,
      subtitle: row.subtitle,
      body: row.body,
      price: row.price,
      ingredients: row.ingredients,
      isPublished: row.is_published,
      updatedAt: row.updated_at,
    }))
    .sort((a, b) => SPECIAL_MOMENTS.indexOf(a.moment) - SPECIAL_MOMENTS.indexOf(b.moment));
});
