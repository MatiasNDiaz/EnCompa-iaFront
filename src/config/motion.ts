/**
 * Configuración ÚNICA de las animaciones del sitio. Ajustar acá tiempos y distancias
 * cuando lleguen las referencias visuales, sin tocar páginas ni componentes.
 * (Las distancias de cada variante viven en globals.css → [data-reveal="…"].)
 */
export const MOTION = {
  /** Duración de la aparición (ms). */
  duration: 700,
  /** Retraso entre elementos de una grilla o lista (ms). */
  stagger: 90,
  /** Tope del retraso acumulado, para que listas largas no tarden en aparecer (ms). */
  maxDelay: 450,
  /** Porción visible del elemento para dispararla. */
  threshold: 0.12,
  /** Dispara un poco antes de que el elemento entre del todo. */
  rootMargin: "0px 0px -6% 0px",
} as const;

export type RevealVariant = "up" | "left" | "right" | "fade" | "scale" | "clip";

/** Retraso para el ítem `index` de una lista escalonada. */
export const staggerDelay = (index: number) => Math.min(index * MOTION.stagger, MOTION.maxDelay);
