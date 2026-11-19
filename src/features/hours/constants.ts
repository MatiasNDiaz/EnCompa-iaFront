/**
 * Constantes y cálculos simples de horarios, SIN Zod: los usan componentes que corren en
 * el navegador (la línea "Hoy: …" del footer). Si importaran schemas.ts, la librería de
 * validación entera viajaría a todas las páginas públicas.
 */

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type Weekday = (typeof WEEKDAYS)[number];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export const MAX_RANGES = 2;
export const MAX_NOTE_LENGTH = 120;

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Una franja tal como se guarda en la base. */
export type TimeRange = { open: string; close: string };
/** Una franja del formulario: el cruce de medianoche se marca a mano. */
export type FormRange = TimeRange & { nextDay: boolean };

export const crossesMidnight = (range: TimeRange) => toMinutes(range.close) < toMinutes(range.open);
