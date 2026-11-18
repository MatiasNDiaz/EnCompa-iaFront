import { z } from "zod";

import { parsePrice } from "@/lib/format";

/** Mismos schemas en los formularios (cliente) y en las Server Actions (servidor). */

export const optionalText = (max: number, tooLong: string) =>
  z
    .string()
    .trim()
    .max(max, { error: tooLong })
    .transform((value) => (value === "" ? null : value));

export const DAY_MOMENTS = ["morning", "midday", "evening"] as const;

export const sectionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Poné un título." })
    .max(120, { error: "El título es muy largo (máximo 120 caracteres)." }),
  description: optionalText(300, "El texto es muy largo (máximo 300 caracteres)."),
  moments: z.array(z.enum(DAY_MOMENTS)),
  // En el <select>, "" = sección principal (sin padre).
  parentId: z.preprocess(
    (value) => (value === "" ? null : value),
    z.uuid({ error: "Elegí una sección válida." }).nullable(),
  ),
  isActive: z.boolean(),
});

export type SectionInput = z.input<typeof sectionSchema>;

/** Precio escrito como texto en el formulario ("8.500"). Vacío = sin precio. */
export const priceField = z
  .union([z.string(), z.number(), z.null()])
  .transform((value) => parsePrice(value))
  .refine((value) => value === null || Number.isFinite(value), {
    error: "Escribí el precio solo con números (por ejemplo 8500).",
  })
  .refine((value) => value === null || value >= 0, { error: "El precio no puede ser negativo." })
  .refine((value) => value === null || value < 100_000_000, { error: "El precio es demasiado alto." });

export const productSchema = z.object({
  categoryId: z.uuid({ error: "Elegí una sección." }),
  name: z
    .string()
    .trim()
    .min(1, { error: "Poné el nombre del producto." })
    .max(120, { error: "El nombre es muy largo (máximo 120 caracteres)." }),
  description: optionalText(1000, "La descripción es muy larga (máximo 1000 caracteres)."),
  ingredients: optionalText(500, "Los ingredientes son muy largos (máximo 500 caracteres)."),
  price: priceField,
  isFeatured: z.boolean(),
  isAvailable: z.boolean(),
});

export type ProductInput = z.input<typeof productSchema>;
