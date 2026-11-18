import { addDays, weekdayOf } from "@/lib/time";

import {
  WEEKDAY_LABELS,
  WEEKDAYS,
  type OpeningException,
  type OpeningHours,
  type TimeRange,
  type Weekday,
} from "./schemas";

/** "09:00" → "9:00". */
export const formatTime = (time: string) => time.replace(/^0(\d)/, "$1");

/** "9:00 a 15:00 y 19:00 a 1:00" · sin franjas: "Cerrado". */
export function formatRanges(ranges: TimeRange[] | null | undefined): string {
  if (!ranges?.length) return "Cerrado";
  return ranges.map((r) => `${formatTime(r.open)} a ${formatTime(r.close)}`).join(" y ");
}

export type WeekRow = { day: Weekday; label: string; value: string };

/** Una fila por día, de lunes a domingo. */
export function weekRows(hours: OpeningHours | null): WeekRow[] | null {
  if (!hours) return null;
  return WEEKDAYS.map((day) => ({
    day,
    label: WEEKDAY_LABELS[day],
    value: formatRanges(hours.find((h) => h.day === day)?.ranges),
  }));
}

/** Días especiales entre hoy y hoy + `days - 1`, en orden. */
export function upcomingExceptions(
  exceptions: OpeningException[],
  today: string,
  days = 7,
): OpeningException[] {
  const last = addDays(today, days - 1);
  return exceptions
    .filter((e) => e.date >= today && e.date <= last)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** "Cerrado" o "9:00 a 13:00" para un día especial. */
export const exceptionHours = (exception: OpeningException) =>
  exception.type === "closed" ? "Cerrado" : formatRanges(exception.ranges);

/** Horario de una fecha: el día especial si hay uno, si no el semanal. */
export function hoursFor(
  date: string,
  hours: OpeningHours | null,
  exceptions: OpeningException[],
): { value: string; note: string | null; special: boolean } | null {
  const exception = exceptions.find((e) => e.date === date);
  if (exception) return { value: exceptionHours(exception), note: exception.note, special: true };
  if (!hours) return null;
  const day = hours.find((h) => h.day === weekdayOf(date));
  return { value: formatRanges(day?.ranges), note: null, special: false };
}
