/** Secciones del panel (sidebar en desktop, barra inferior en mobile). */
export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Inicio", icon: "inicio" },
  { href: "/admin/carta", label: "Carta", icon: "carta" },
  { href: "/admin/plato-del-dia", label: "Plato del día", icon: "plato" },
  { href: "/admin/cuenta", label: "Mi cuenta", icon: "cuenta" },
] as const;

export type AdminNavIcon = (typeof ADMIN_NAV)[number]["icon"];
