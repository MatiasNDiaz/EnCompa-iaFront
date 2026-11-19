import "server-only";

import { cache } from "react";

import { isCardLayout } from "@/features/news/types";
import { requireAdmin } from "@/lib/auth/admin";
import { getMediaUrl } from "@/lib/storage/media";
import { QueryError } from "@/lib/supabase/query-error";

import type { AdminNewsPost } from "./types";

/**
 * Todas las novedades (también los borradores: la RLS se los deja ver al admin), con la
 * sesión del admin. Primero las publicadas más recientes, después los borradores. Sin caché.
 */
export const getAdminNews = cache(async (): Promise<AdminNewsPost[]> => {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("news_posts")
    .select(
      "id, slug, title, description, closing_message, event_date, media_type, media_path, poster_path, is_published, published_at, created_at, card_layout",
    )
    .order("is_published", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new QueryError("las novedades", error);

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    closingMessage: row.closing_message,
    eventDate: row.event_date,
    mediaType: row.media_type === "video" ? "video" : "image",
    mediaPath: row.media_path,
    mediaUrl: getMediaUrl(row.media_path),
    posterPath: row.poster_path,
    posterUrl: getMediaUrl(row.poster_path),
    isPublished: row.is_published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    cardLayout: isCardLayout(row.card_layout) ? row.card_layout : "split",
  }));
});
