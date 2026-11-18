/**
 * Secciones del panel. En desktop la sidebar muestra todas. En mobile la barra inferior
 * muestra las de `inBar` (las de todos los días) y "Más" abre el resto.
 */
export const ADMIN_NAV = [
  { href: "/admin/dashboard", label: "Inicio", icon: "inicio", inBar: true },
  { href: "/admin/carta", label: "Carta", icon: "carta", inBar: true },
  { href: "/admin/plato-del-dia", label: "Plato del día", icon: "plato", inBar: true },
  { href: "/admin/horarios", label: "Horarios", icon: "horarios", inBar: true },
  { href: "/admin/novedades", label: "Novedades", icon: "novedades", inBar: false },
  { href: "/admin/cuenta", label: "Mi cuenta", icon: "cuenta", inBar: false },
] as const;

export type AdminNavIcon = (typeof ADMIN_NAV)[number]["icon"];
