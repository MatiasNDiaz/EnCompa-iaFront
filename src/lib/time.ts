/**
 * Hora local del bar. Todo lo que depende del "hoy" o de la hora (sin stock por hoy,
 * plato del día, saludo del panel) se calcula en esta zona, no en la del servidor ni
 * en la del navegador.
 */
export const BAR_TIME_ZONE = "America/Argentina/Cordoba";

const DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: BAR_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const HOUR = new Intl.DateTimeFormat("en-GB", {
  timeZone: BAR_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const LONG_DATE = new Intl.DateTimeFormat("es-AR", {
  timeZone: BAR_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** Fecha de hoy en el bar, `YYYY-MM-DD` (mismo formato que una columna `date`). */
export function barToday(now: Date = new Date()): string {
  return DATE_PARTS.format(now);
}

/** Minutos desde la medianoche en el bar (0–1439). */
export function barMinutes(now: Date = new Date()): number {
  const [h, m] = HOUR.format(now).split(":").map(Number);
  return h * 60 + m;
}

/** "Lunes 17 de noviembre". */
export function barLongDate(now: Date = new Date()): string {
  return capitalize(LONG_DATE.format(now));
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

// Fechas `YYYY-MM-DD` (columna `date`): se interpretan como día calendario, sin zona.
const fromIsoDate = (iso: string) => new Date(`${iso}T12:00:00Z`);

const WEEKDAY_EN = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long" });
const DAY_AND_NUMBER = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
});
const DAY_NUMBER_MONTH = new Intl.DateTimeFormat("es-AR", {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

/** `YYYY-MM-DD` + n días. */
export function addDays(iso: string, days: number): string {
  const date = fromIsoDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Día de la semana de una fecha, en inglés y minúsculas ("monday"), como en la base. */
export function weekdayOf(iso: string) {
  return WEEKDAY_EN.format(fromIsoDate(iso)).toLowerCase() as
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

/** "Domingo 23" (o "Domingo 23 de noviembre" con `withMonth`). */
export function formatDayDate(iso: string, withMonth = false): string {
  return capitalize((withMonth ? DAY_NUMBER_MONTH : DAY_AND_NUMBER).format(fromIsoDate(iso)));
}
