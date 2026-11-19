import { barLongDate, barToday, formatDayDate } from "@/lib/time";

import type { NewsPost } from "./types";

/** "Sábado 23 de noviembre" (fecha del evento) o la fecha de publicación. */
export function newsDateLabel(post: Pick<NewsPost, "eventDate" | "publishedAt">): string | null {
  if (post.eventDate) return formatDayDate(post.eventDate, true);
  if (post.publishedAt) return barLongDate(new Date(post.publishedAt));
  return null;
}

const SHORT_DATE = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** "18 de noviembre, 2026" (tarjetas): la fecha del evento o la de publicación. */
export function newsShortDate(post: Pick<NewsPost, "eventDate" | "publishedAt">): string {
  const iso = post.eventDate ?? (post.publishedAt ? barToday(new Date(post.publishedAt)) : null);
  if (!iso) return "";
  return SHORT_DATE.format(new Date(`${iso}T12:00:00Z`)).replace(/ de (\d{4})$/, ", $1");
}

/** Primer párrafo, recortado para las tarjetas. */
export function newsExcerpt(description: string, max = 160): string {
  const first = description.split(/\n\s*\n/)[0]?.trim() ?? "";
  if (first.length <= max) return first;
  return `${first.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
