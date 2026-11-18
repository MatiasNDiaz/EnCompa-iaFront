import { z } from "zod";

import { DAY_MOMENTS, optionalText, priceField } from "@/features/admin/menu/schemas";

/** Mismo schema en el formulario (cliente) y en la Server Action (servidor). */

export const momentSchema = z.enum(DAY_MOMENTS);

/** Mismo límite que la base (CHECK de la migración 16). */
export const MAX_INGREDIENTS_LENGTH = 500;

export const specialSchema = z.object({
  title: optionalText(120, "El título es muy largo (máximo 120 caracteres)."),
  subtitle: optionalText(160, "El subtítulo es muy largo (máximo 160 caracteres)."),
  body: optionalText(1000, "El texto es muy largo (máximo 1000 caracteres)."),
  price: priceField,
  // Texto libre, como los ingredientes de los productos de la carta.
  ingredients: optionalText(
    MAX_INGREDIENTS_LENGTH,
    `Los ingredientes son muy largos (máximo ${MAX_INGREDIENTS_LENGTH} caracteres).`,
  ),
});

export type SpecialInput = z.input<typeof specialSchema>;

export const PUBLISH_NEEDS = "Para publicarlo necesita una foto y un título.";
