/**
 * Tags de caché por feature. Las queries públicas etiquetan sus fetch con estos tags y
 * las Server Actions del CMS (Fase 5) invalidan solo el tag que corresponde con
 * `updateTag()` (read-your-own-writes: el admin ve el cambio en la siguiente carga).
 */
export const CACHE_TAGS = {
  settings: "settings",
  institutional: "institutional",
  menu: "menu",
  specials: "specials",
  /** Días especiales (opening_exceptions). El horario semanal va con `settings`. */
  hours: "hours",
  news: "news",
  tour: "tour",
  gallery: "gallery",
  trainings: "trainings",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
