import type { Enums } from "@/types/database.types";

/**
 * Horarios del plato del día (hora de Córdoba). ⚠️ PROVISORIOS: a confirmar con los
 * dueños. Para cambiarlos, editá solo esta constante.
 *
 * Cada momento empieza a la hora indicada y dura hasta que empieza el siguiente:
 *   mañana       06:00 → 11:59
 *   mediodía     12:00 → 15:59
 *   tarde/noche  16:00 → 05:59 (cruza la medianoche)
 */
export const SPECIALS_SCHEDULE: Record<Enums<"day_moment">, { from: number }> = {
  morning: { from: 6 * 60 },
  midday: { from: 12 * 60 },
  evening: { from: 16 * 60 },
};

/**
 * Filtro "Platos del día" de la carta: `/carta?ver=platos-del-dia`. Lo usan el ítem
 * "Plato del día" del nav, el filtro de la carta y el "Ver en la web" del panel.
 */
export const SPECIALS_VIEW_PARAM = "ver";
export const SPECIALS_VIEW = "platos-del-dia";
export const SPECIALS_HREF = `/carta?${SPECIALS_VIEW_PARAM}=${SPECIALS_VIEW}`;

/** Ancla de la lista de platos: el nav y el panel llevan directo ahí (se ve la animación). */
export const SPECIALS_LIST_ID = "platos-del-dia";
export const SPECIALS_NAV_HREF = `${SPECIALS_HREF}#${SPECIALS_LIST_ID}`;
