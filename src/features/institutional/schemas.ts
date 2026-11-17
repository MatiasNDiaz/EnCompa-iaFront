import { z } from "zod";

/** Ítems de las secciones con lista (values, moments, name_meaning, experience). */
export const valueItemsSchema = z
  .array(
    z.object({
      title: z.string().trim().min(1).max(120),
      description: z.string().trim().min(1).max(500),
    }),
  )
  .max(12);

export type ValueItem = z.infer<typeof valueItemsSchema>[number];

// Las secciones válidas las define el CHECK de `site_content.section` en la base
// (un CHECK no genera tipo TS); esta lista debe coincidir con la migración.
export const SITE_SECTIONS = [
  "home_hero",
  "offer_coffee",
  "offer_tapas",
  "offer_cocktails",
  "history",
  "essence",
  "mission",
  "vision",
  "values",
  "differentiation",
  "moments",
  "name_meaning",
  "experience",
] as const;

export type SiteSection = (typeof SITE_SECTIONS)[number];
