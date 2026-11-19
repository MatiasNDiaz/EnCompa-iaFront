import { z } from "zod";

import { optionalText } from "@/features/admin/menu/schemas";
import { NEWS_LIMITS } from "@/features/news/types";

/** Textos del formulario de una novedad (los archivos viajan aparte). */
export const newsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Escribí un título." })
    .max(NEWS_LIMITS.title, { error: `El título es muy largo (máximo ${NEWS_LIMITS.title}).` }),
  description: z
    .string()
    .trim()
    .min(1, { error: "Escribí la descripción." })
    .max(NEWS_LIMITS.description, {
      error: `La descripción es muy larga (máximo ${NEWS_LIMITS.description} caracteres).`,
    }),
  closingMessage: optionalText(
    NEWS_LIMITS.closingMessage,
    `El mensaje final es muy largo (máximo ${NEWS_LIMITS.closingMessage} caracteres).`,
  ),
  eventDate: z
    .union([z.literal(""), z.iso.date({ error: "Elegí una fecha válida." })])
    .transform((value) => (value === "" ? null : value)),
  mediaType: z.enum(["image", "video"]),
  cardLayout: z.enum(["split", "stacked", "curved"]),
});

export type NewsFormValues = z.input<typeof newsSchema>;
export type NewsInput = z.output<typeof newsSchema>;

/** El archivo principal: se conserva el guardado o se usa uno recién subido. */
export type MediaChange = { kind: "keep" } | { kind: "new"; path: string };

export const MEDIA_NEEDED = "Subí una foto o un video.";
export const POSTER_NEEDED = "El video necesita una portada (una foto).";
