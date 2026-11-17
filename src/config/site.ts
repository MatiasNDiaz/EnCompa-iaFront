/**
 * Datos de marca y navegación. Solo información oficial del CLAUDE.md; lo editable
 * (dirección, redes, horarios…) vive en `site_settings` y se administra desde el CMS.
 */
export const SITE = {
  name: "En Compañía",
  /** Descriptor para textos de la web (el del logo, "Café · Tapeo · Vermú", va solo en el logo). */
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
