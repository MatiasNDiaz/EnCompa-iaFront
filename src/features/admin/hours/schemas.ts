import { z } from "zod";

import { optionalText } from "@/features/admin/menu/schemas";
import {
  crossesMidnight,
  MAX_NOTE_LENGTH,
  MAX_RANGES,
  overlappingDay,
  rangeIssues,
  timeSchema,
  WEEKDAY_LABELS,
  WEEKDAYS,
  type FormRange,
  type OpeningHours,
  type TimeRange,
  type Weekday,
} from "@/features/hours/schemas";

/**
 * Formularios de horarios del panel. Las reglas son las de src/features/hours/schemas.ts
 * (y las de la base); acá se suma que el cruce de medianoche se marca a mano
 * («Cierra al día siguiente»), para que un error de tipeo no quede como horario nocturno.
 */

const formRangeSchema = z.object({ open: timeSchema, close: timeSchema, nextDay: z.boolean() });

/** Errores por campo: `ranges.<i>.<campo>` (lo que muestra el formulario). */
export type RangeErrors = Record<string, string>;

/** Valida las franjas de un día y devuelve los errores por campo (vacío = bien). */
export function validateRanges(ranges: FormRange[], prefix = "ranges"): RangeErrors {
  const errors: RangeErrors = {};
  ranges.forEach((range, i) => {
    if (!timeSchema.safeParse(range.open).success) errors[`${prefix}.${i}.open`] = "Elegí una hora.";
    if (!timeSchema.safeParse(range.close).success) errors[`${prefix}.${i}.close`] = "Elegí una hora.";
  });
  for (const issue of rangeIssues(ranges, true))
    errors[`${prefix}.${issue.index}.${issue.field}`] ??= issue.message;
  return errors;
}

const toStored = (ranges: FormRange[]): TimeRange[] =>
  ranges.map(({ open, close }) => ({ open, close }));

export const toFormRanges = (ranges: TimeRange[] | null | undefined): FormRange[] =>
  (ranges ?? []).map((range) => ({ ...range, nextDay: crossesMidnight(range) }));

// -----------------------------------------------------------------------------
// Horario semanal
// -----------------------------------------------------------------------------

export type WeekDayValues = { day: Weekday; isOpen: boolean; ranges: FormRange[] };

export const weekSchema = z
  .array(
    z.object({
      day: z.enum(WEEKDAYS),
      isOpen: z.boolean(),
      ranges: z.array(formRangeSchema).max(MAX_RANGES),
    }),
  )
  .length(7);

/** Errores del horario semanal, con clave `<día>.ranges.<i>.<campo>` o `<día>`. */
export function validateWeek(days: WeekDayValues[]): RangeErrors {
  const errors: RangeErrors = {};
  for (const day of days) {
    if (!day.isOpen) continue;
    if (day.ranges.length === 0) errors[day.day] = "Agregá un horario o marcá el día como cerrado.";
    Object.assign(errors, validateRanges(day.ranges, `${day.day}.ranges`));
  }
  if (Object.keys(errors).length > 0) return errors;

  const ordered = WEEKDAYS.map((name) => days.find((d) => d.day === name)!);
  const overlap = overlappingDay(
    ordered.map((d) => ({ ranges: d.isOpen ? toStored(d.ranges) : [] })),
  );
  if (overlap !== null) {
    const day = ordered[overlap];
    const next = WEEKDAY_LABELS[WEEKDAYS[(overlap + 1) % 7]].toLowerCase();
    errors[`${day.day}.ranges.${day.ranges.length - 1}.close`] =
      `Cierra después de que abre el ${next}. Revisá los dos horarios.`;
  }
  return errors;
}

export function weekToStored(days: WeekDayValues[]): OpeningHours {
  return WEEKDAYS.map((name) => {
    const day = days.find((d) => d.day === name)!;
    return { day: name, ranges: day.isOpen ? toStored(day.ranges) : [] };
  });
}

export function weekFromStored(hours: OpeningHours | null): WeekDayValues[] {
  return WEEKDAYS.map((name) => {
    const ranges = toFormRanges(hours?.find((h) => h.day === name)?.ranges);
    return { day: name, isOpen: ranges.length > 0, ranges };
  });
}

// -----------------------------------------------------------------------------
// Días especiales
// -----------------------------------------------------------------------------

export type ExceptionValues = {
  date: string;
  type: "closed" | "custom";
  ranges: FormRange[];
  note: string;
};

export const exceptionSchema = z.object({
  date: z.iso.date({ error: "Elegí una fecha." }),
  type: z.enum(["closed", "custom"]),
  ranges: z.array(formRangeSchema).max(MAX_RANGES),
  note: optionalText(
    MAX_NOTE_LENGTH,
    `La nota es muy larga (máximo ${MAX_NOTE_LENGTH} caracteres).`,
  ),
});

/** Errores del día especial (`date`, `note`, `ranges`, `ranges.<i>.<campo>`). */
export function validateException(values: ExceptionValues, today: string): RangeErrors {
  const errors: RangeErrors = {};
  if (!z.iso.date().safeParse(values.date).success) errors.date = "Elegí una fecha.";
  else if (values.date < today) errors.date = "Elegí hoy o una fecha que todavía no pasó.";
  if (values.note.trim().length > MAX_NOTE_LENGTH)
    errors.note = `La nota es muy larga (máximo ${MAX_NOTE_LENGTH} caracteres).`;
  if (values.type === "custom") {
    if (values.ranges.length === 0) errors.ranges = "Agregá al menos un horario.";
    Object.assign(errors, validateRanges(values.ranges));
  }
  return errors;
}

export const exceptionToStored = (values: ExceptionValues) => ({
  date: values.date,
  type: values.type,
  ranges: values.type === "custom" ? toStored(values.ranges) : null,
  note: values.note.trim() === "" ? null : values.note.trim(),
});
