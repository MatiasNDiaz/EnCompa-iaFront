import { SPECIALS_NAV_HREF } from "./specials";

/**
 * Datos de marca y navegación. Solo información oficial del CLAUDE.md; lo editable
 * (dirección, redes, horarios…) vive en `site_settings` y se administra desde el CMS.
 */
export const SITE = {
  name: "En Compañía",
  /** Descriptor de la marca: el mismo del logo 2026, en todos los textos de la web. */
  descriptor: "Café · Tapeo · Cocktails",
  claim: "Donde los encuentros saben mejor.",
  locality: "La Cumbre, Córdoba",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type NavItem = { href: string; label: string };

/** Navegación principal (dirección de arte: mínima). */
export const MAIN_NAV: NavItem[] = [
  { href: "/", label: "Inicio" },
  { href: "/carta", label: "Nuestra carta" },
  { href: "/nosotros", label: "Nosotros" },
  // Formación y equipo en una sola página.
  { href: "/capacitaciones", label: "Formación" },
  // Galería única (reúne lo que antes era "El espacio": /recorrido redirige acá).
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Ubicación" },
];

/** Secciones adicionales: menú mobile y footer (hoy todas están en la principal). */
export const SECONDARY_NAV: NavItem[] = [];

export const ALL_NAV: NavItem[] = [...MAIN_NAV, ...SECONDARY_NAV];

/**
 * Ítem "Plato del día": lleva a la carta → "Platos del día", directo a la lista.
 * Va después de "Inicio" y solo si hay platos publicados.
 */
export const SPECIALS_NAV_ITEM: NavItem = { href: SPECIALS_NAV_HREF, label: "Plato del día" };

/** Ítem "Novedades": va después de "Plato del día" y solo si hay alguna publicada. */
export const NEWS_NAV_ITEM: NavItem = { href: "/novedades", label: "Novedades" };

/** Qué ítems condicionales se muestran (según haya contenido publicado). */
export type NavExtras = { specials: boolean; news: boolean };

export function withExtras(items: NavItem[], extras: NavExtras): NavItem[] {
  const added = [
    ...(extras.specials ? [SPECIALS_NAV_ITEM] : []),
    ...(extras.news ? [NEWS_NAV_ITEM] : []),
  ];
  const home = items.findIndex((item) => item.href === "/");
  return [...items.slice(0, home + 1), ...added, ...items.slice(home + 1)];
}
