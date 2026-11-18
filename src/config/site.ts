import { SPECIALS_NAV_HREF } from "./specials";

/**
 * Datos de marca y navegación. Solo información oficial del CLAUDE.md; lo editable
 * (dirección, redes, horarios…) vive en `site_settings` y se administra desde el CMS.
 */
export const SITE = {
  name: "En Compañía",
  /** Descriptor para textos de la web (el del logo 2026, "Café · Tapeo · Cocktails", va solo en el logo). */
  descriptor: "Café · Tapas · Cocktails",
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
  { href: "/recorrido", label: "El espacio" },
  { href: "/contacto", label: "Ubicación" },
];

/** Secciones adicionales: menú mobile y footer. */
export const SECONDARY_NAV: NavItem[] = [
  { href: "/capacitaciones", label: "Formación" },
  { href: "/galeria", label: "Galería" },
];

export const ALL_NAV: NavItem[] = [...MAIN_NAV, ...SECONDARY_NAV];

/**
 * Ítem "Plato del día": lleva a la carta → "Platos del día", directo a la lista.
 * Va después de "Inicio" y solo si hay platos publicados.
 */
export const SPECIALS_NAV_ITEM: NavItem = { href: SPECIALS_NAV_HREF, label: "Plato del día" };

export function withSpecials(items: NavItem[], show: boolean): NavItem[] {
  if (!show) return items;
  const home = items.findIndex((item) => item.href === "/");
  return [...items.slice(0, home + 1), SPECIALS_NAV_ITEM, ...items.slice(home + 1)];
}
