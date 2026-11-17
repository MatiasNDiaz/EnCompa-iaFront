import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";
import type { Tables } from "@/types/database.types";

import { SITE_SECTIONS, valueItemsSchema, type SiteSection, type ValueItem } from "./schemas";

export type SiteContentBlock = Omit<Tables<"site_content">, "items" | "section"> & {
  section: SiteSection;
  items: ValueItem[] | null;
};

export type SiteContentMap = Partial<Record<SiteSection, SiteContentBlock>>;

const isSection = (value: string): value is SiteSection =>
  (SITE_SECTIONS as readonly string[]).includes(value);

/** Todo el contenido institucional indexado por sección (son 10 filas: una sola consulta). */
export const getSiteContent = cache(async (): Promise<SiteContentMap> => {
  const { data, error } = await createPublicClient([CACHE_TAGS.institutional])
    .from("site_content")
    .select("*");

  if (error) throw new QueryError("el contenido institucional", error);

  const map: SiteContentMap = {};
  for (const row of data) {
    if (!isSection(row.section)) continue;
    const items = valueItemsSchema.safeParse(row.items);
    map[row.section] = { ...row, section: row.section, items: items.success ? items.data : null };
  }
  return map;
});
