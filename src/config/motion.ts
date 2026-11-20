/**
 * Configuración de las animaciones del sitio (lo que necesita JavaScript).
 * Duraciones y distancias viven en globals.css (:root): 0,5 s en mobile y 1 s, con más
 * recorrido, desde tablet (768 px). Los retrasos de acá se multiplican allá por
 * --motion-delay-scale (1 en mobile, 1,8 desde tablet).
 */
export const MOTION = {
  /** Retraso entre elementos de una grilla o lista (ms). */
  stagger: 60,
  /** Tope del retraso acumulado, para que listas largas no tarden en aparecer (ms). */
  maxDelay: 300,
  /** Porción visible del elemento para dispararla. */
  threshold: 0.12,
  /** Dispara un poco antes de que el elemento entre del todo. */
  rootMargin: "0px 0px -6% 0px",
} as const;

export type RevealVariant = "up" | "left" | "right" | "fade" | "scale" | "clip";

/** Retraso para el ítem `index` de una lista escalonada. */
export const staggerDelay = (index: number) => Math.min(index * MOTION.stagger, MOTION.maxDelay);
