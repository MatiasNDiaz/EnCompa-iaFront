import { barLongDate, formatDayDate } from "@/lib/time";

import type { NewsPost } from "./types";

/** "Sábado 23 de noviembre" (fecha del evento) o la fecha de publicación. */
export function newsDateLabel(post: Pick<NewsPost, "eventDate" | "publishedAt">): string | null {
  if (post.eventDate) return formatDayDate(post.eventDate, true);
  if (post.publishedAt) return barLongDate(new Date(post.publishedAt));
  return null;
}

/** Primer párrafo, recortado para las tarjetas. */
export function newsExcerpt(description: string, max = 160): string {
  const first = description.split(/\n\s*\n/)[0]?.trim() ?? "";
  if (first.length <= max) return first;
  return `${first.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
