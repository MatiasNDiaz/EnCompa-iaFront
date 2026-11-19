import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { getMediaUrl } from "@/lib/storage/media";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";
import type { Tables } from "@/types/database.types";

import { isCardLayout, type NewsPost } from "./types";

type Row = Pick<
  Tables<"news_posts">,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "closing_message"
  | "event_date"
  | "published_at"
  | "media_type"
  | "media_path"
  | "poster_path"
  | "card_layout"
>;

export const NEWS_COLUMNS =
  "id, slug, title, description, closing_message, event_date, published_at, media_type, media_path, poster_path, card_layout";

export function toNewsPost(row: Row): NewsPost | null {
  const url = getMediaUrl(row.media_path);
  if (!url) return null;
  const posterUrl = getMediaUrl(row.poster_path);
  const media =
    row.media_type === "video"
      ? posterUrl
        ? ({ type: "video", url, posterUrl } as const)
        : null
      : ({ type: "image", url } as const);
  if (!media) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    closingMessage: row.closing_message,
    eventDate: row.event_date,
    publishedAt: row.published_at,
    media,
    cardLayout: isCardLayout(row.card_layout) ? row.card_layout : "split",
  };
}

/**
 * Novedades publicadas (la RLS ya filtra los borradores), de la más reciente a la más
 * vieja. Con caché por tag `news`: el panel lo invalida al guardar.
 */
export const getPublishedNews = cache(async (): Promise<NewsPost[]> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.news])
    .from("news_posts")
    .select(NEWS_COLUMNS)
    .order("published_at", { ascending: false })
    .limit(60);

  if (error) throw new QueryError("las novedades", error);
  return data.flatMap((row) => toNewsPost(row) ?? []);
});
