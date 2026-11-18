import { z } from "zod";

/**
 * Horarios del local. Mismas reglas que la base (migración 21,
 * private.is_valid_opening_hours / is_valid_opening_ranges):
 * - Horario semanal: los 7 días, una vez cada uno. Día sin franjas = cerrado.
 * - Hasta 2 franjas por día, en orden y sin superponerse.
 * - Cierre menor que la apertura = termina al día siguiente (ej. 19:00 → 01:00). Solo la
 *   última franja del día puede cruzar la medianoche, y no puede pisar el día siguiente.
 * - Días especiales: una fecha cerrada o con 1–2 franjas, y una nota opcional.
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

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
export const timeSchema = z.string().regex(TIME, { error: "Elegí una hora." });

export const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Una franja tal como se guarda en la base. */
export type TimeRange = { open: string; close: string };
/** Una franja del formulario: el cruce de medianoche se marca a mano. */
export type FormRange = TimeRange & { nextDay: boolean };

export const crossesMidnight = (range: TimeRange) => toMinutes(range.close) < toMinutes(range.open);

type RangeIssue = { index: number; field: "open" | "close" | "nextDay"; message: string };

/**
 * Problemas de las franjas de UN día (vacío = todo bien). Con `explicit`, el cruce de
 * medianoche tiene que estar marcado con `nextDay` (formularios del panel); sin él, se
 * deduce de las horas (datos guardados).
 */
export function rangeIssues(ranges: (TimeRange & { nextDay?: boolean })[], explicit: boolean) {
  const issues: RangeIssue[] = [];
  let previousEnd: number | null = null;

  ranges.forEach((range, index) => {
    if (!TIME.test(range.open) || !TIME.test(range.close)) return; // lo informa timeSchema
    const open = toMinutes(range.open);
    let close = toMinutes(range.close);
    const overnight = explicit ? Boolean(range.nextDay) : close < open;

    if (open === close) {
      issues.push({ index, field: "close", message: "Abre y cierra a la misma hora." });
      return;
    }
    if (explicit && !overnight && close < open) {
      issues.push({
        index,
        field: "close",
        message:
          "Termina antes de empezar. Si cierra después de medianoche, marcá «Cierra al día siguiente».",
      });
      return;
    }
    if (explicit && overnight && close > open) {
      issues.push({
        index,
        field: "nextDay",
        message: "Si cierra al día siguiente, el cierre tiene que ser más temprano que la apertura.",
      });
      return;
    }
    if (overnight && index < ranges.length - 1) {
      issues.push({
        index,
        field: "nextDay",
        message: "Solo el último horario del día puede cerrar después de medianoche.",
      });
      return;
    }
    if (overnight) close += 24 * 60;

    if (previousEnd !== null && open < previousEnd) {
      issues.push({
        index,
        field: "open",
        message: "Se superpone con el horario anterior o está antes. Tiene que empezar después.",
      });
    }
    previousEnd = close;
  });

  return issues;
}

const storedRangeSchema = z.strictObject({ open: timeSchema, close: timeSchema });

const storedRangesSchema = z
  .array(storedRangeSchema)
  .max(MAX_RANGES)
  .superRefine((ranges, ctx) => {
    for (const issue of rangeIssues(ranges, false))
      ctx.addIssue({ code: "custom", message: issue.message, path: [issue.index, issue.field] });
  });

/** Cuántos minutos después de la medianoche del día siguiente sigue abierto (o null). */
function spillUntil(ranges: TimeRange[]): number | null {
  const last = ranges.at(-1);
  return last && crossesMidnight(last) ? toMinutes(last.close) : null;
}

/**
 * Problema de cruce entre días (la noche de un día pisa la mañana del siguiente):
 * devuelve el índice del día que se pasa, o null.
 */
export function overlappingDay(days: { ranges: TimeRange[] }[]): number | null {
  for (let i = 0; i < days.length; i++) {
    const spill = spillUntil(days[i].ranges);
    const next = days[(i + 1) % days.length].ranges[0];
    if (spill !== null && next && toMinutes(next.open) < spill) return i;
  }
  return null;
}

/** Forma de `site_settings.opening_hours`. */
export const openingHoursSchema = z
  .array(z.strictObject({ day: z.enum(WEEKDAYS), ranges: storedRangesSchema }))
  .length(7)
  .superRefine((days, ctx) => {
    const seen = new Set(days.map((d) => d.day));
    if (seen.size !== WEEKDAYS.length)
      ctx.addIssue({ code: "custom", message: "Falta algún día de la semana." });
    const ordered = WEEKDAYS.map((day) => days.find((d) => d.day === day)!).filter(Boolean);
    const overlap = overlappingDay(ordered);
    if (overlap !== null)
      ctx.addIssue({
        code: "custom",
        message: `El horario del ${WEEKDAY_LABELS[WEEKDAYS[overlap]].toLowerCase()} se pisa con el día siguiente.`,
      });
  });

export type OpeningHours = z.infer<typeof openingHoursSchema>;

/** Fila de `opening_exceptions` tal como la lee la web. */
export const openingExceptionSchema = z
  .object({
    id: z.string(),
    date: z.iso.date(),
    type: z.enum(["closed", "custom"]),
    ranges: storedRangesSchema.nullable(),
    note: z.string().nullable(),
  })
  .refine((row) => (row.type === "closed" ? row.ranges === null : (row.ranges?.length ?? 0) > 0));

export type OpeningException = z.infer<typeof openingExceptionSchema>;
