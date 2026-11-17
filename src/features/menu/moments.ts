import type { Enums } from "@/types/database.types";

import type { MenuCategory, MenuSubcategory } from "./queries";

/**
 * Momentos del día de la carta (mañana, mediodía, tarde/noche).
 *
 * La base guarda el enum `day_moment` (morning/midday/evening) y resuelve la herencia
 * padre → subcategoría en la vista `categories_with_moments`. Acá solo se traduce a la URL
 * (`/carta?momento=manana`) y se filtra el árbol ya cargado.
 */
export type DayMoment = Enums<"day_moment">;

export type MomentDefinition = {
  value: DayMoment;
  /** Valor en la URL (?momento=). */
  param: string;
  /** Etiqueta del selector y del título ("Carta · Mañana"). */
  label: string;
  /** Complemento para frases: "la carta de la mañana". */
  ofLabel: string;
};

export const MOMENTS: readonly MomentDefinition[] = [
  { value: "morning", param: "manana", label: "Mañana", ofLabel: "de la mañana" },
  { value: "midday", param: "mediodia", label: "Mediodía", ofLabel: "del mediodía" },
  { value: "evening", param: "tarde-noche", label: "Tarde / Noche", ofLabel: "de la tarde / noche" },
];

export const MOMENT_PARAM = "momento";

/** `?momento=` → momento. Ausente, repetido o inválido = `null` (carta completa, sin error). */
export function parseMoment(raw: string | string[] | undefined): MomentDefinition | null {
  if (typeof raw !== "string") return null;
  return MOMENTS.find((m) => m.param === raw) ?? null;
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/**
 * Momento de una tarjeta de la home a partir de su título ("Mañana · Café y pastelería").
 * Si el texto se edita y ya no empieza con el momento, se usa el orden como respaldo.
 */
export function momentFromTitle(title: string, index: number): MomentDefinition | null {
  const head = normalize(title.split("·")[0] ?? "");
  if (head.includes("manana")) return MOMENTS[0];
  if (head.includes("mediodia")) return MOMENTS[1];
  if (head.includes("tarde") || head.includes("noche")) return MOMENTS[2];
  return MOMENTS[index] ?? null;
}

/**
 * Bajada de un momento tomada del contenido institucional (sección `moments`):
 * "Mañana · Café y pastelería" → "Café y pastelería". No se inventa texto.
 */
export function momentTagline(
  items: { title: string }[] | null | undefined,
  moment: MomentDefinition,
): string | null {
  const index = (items ?? []).findIndex((item, i) => momentFromTitle(item.title, i) === moment);
  if (index === -1) return null;
  const [, ...rest] = items![index].title.split("·");
  return rest.join("·").trim() || null;
}

/** Link a la carta (o a una sección) conservando el momento elegido. */
export function cartaHref(slug?: string, moment?: MomentDefinition | null): string {
  const path = slug ? `/carta/${slug}` : "/carta";
  return moment ? `${path}?${MOMENT_PARAM}=${moment.param}` : path;
}

const servesIn = (node: { effectiveMoments: DayMoment[] }, moment: DayMoment) =>
  node.effectiveMoments.includes(moment);

/**
 * Deja solo lo que se sirve en ese momento:
 * - productos directos de una categoría → si la categoría tiene el momento;
 * - subcategorías → si su momento efectivo (propio o heredado) coincide;
 * - categorías que quedan vacías → no aparecen.
 */
export function filterCategoryByMoment(
  category: MenuCategory,
  moment: DayMoment,
): MenuCategory | null {
  const products = servesIn(category, moment) ? category.products : [];
  const subcategories = category.subcategories.filter((sub: MenuSubcategory) =>
    servesIn(sub, moment),
  );
  if (products.length === 0 && subcategories.length === 0) return null;
  return { ...category, products, subcategories };
}

export function filterMenuByMoment(
  menu: MenuCategory[],
  moment: MomentDefinition | null,
): MenuCategory[] {
  if (!moment) return menu;
  return menu.flatMap((category) => filterCategoryByMoment(category, moment.value) ?? []);
}
