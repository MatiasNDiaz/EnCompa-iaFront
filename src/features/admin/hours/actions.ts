"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import type { ActionResult } from "@/features/admin/menu/types";
import { openingHoursSchema } from "@/features/hours/schemas";
import { requireAdmin } from "@/lib/auth/admin";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { barToday, formatDayDate } from "@/lib/time";

import {
  exceptionSchema,
  exceptionToStored,
  validateException,
  validateWeek,
  weekSchema,
  weekToStored,
  type ExceptionValues,
  type WeekDayValues,
} from "./schemas";

/**
 * Server Actions de horarios. Igual que el resto del panel: requireAdmin() + las mismas
 * reglas que el formulario + CHECK y RLS en la base (migración 21).
 * Al guardar se invalidan `settings` (horario semanal) y `hours` (días especiales):
 * Ubicación y el footer se actualizan en el momento.
 */

const SESSION_ERROR = { ok: false, error: "Tu sesión terminó. Volvé a ingresar." } as const;
const INVALID = { ok: false, error: "Hay horarios para revisar en el formulario." } as const;

async function admin() {
  try {
    return (await requireAdmin()).supabase;
  } catch {
    return null;
  }
}

function friendly(error: PostgrestError, fallback: string): string {
  switch (error.code) {
    case "23514":
      return "Algún horario no es válido. Revisá el formulario.";
    case "42501":
      return "No tenés permiso para hacer esto.";
    default:
      console.error("[horarios]", error.code, error.message);
      return fallback;
  }
}

function saved() {
  updateTag(CACHE_TAGS.settings);
  updateTag(CACHE_TAGS.hours);
  refresh();
}

/** Guarda el horario semanal completo (los 7 días). */
export async function saveWeeklyHours(days: WeekDayValues[]): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const parsed = weekSchema.safeParse(days);
  if (!parsed.success || Object.keys(validateWeek(parsed.data)).length > 0) return INVALID;
  const hours = openingHoursSchema.safeParse(weekToStored(parsed.data));
  if (!hours.success) return INVALID;

  const { error } = await supabase
    .from("site_settings")
    .update({ opening_hours: hours.data })
    .eq("singleton", true)
    .select("singleton")
    .single();
  if (error) return { ok: false, error: friendly(error, "No pudimos guardar el horario. Probá de nuevo.") };

  saved();
  return { ok: true, data: undefined };
}

/** Crea (`id` null) o edita un día especial. */
export async function saveException(
  id: string | null,
  values: ExceptionValues,
): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  if (id !== null && !z.uuid().safeParse(id).success)
    return { ok: false, error: "No encontramos ese día. Recargá la página." };

  const parsed = exceptionSchema.safeParse(values);
  if (!parsed.success) return INVALID;
  const input = { ...parsed.data, note: parsed.data.note ?? "" };
  if (Object.keys(validateException(input, barToday())).length > 0) return INVALID;
  const row = exceptionToStored(input);

  const query = id
    ? supabase.from("opening_exceptions").update(row).eq("id", id)
    : supabase.from("opening_exceptions").insert(row);
  const { error } = await query.select("id").single();
  if (error) {
    if (error.code === "23505")
      return {
        ok: false,
        error: `Ya hay un día especial el ${formatDayDate(row.date, true).toLowerCase()}. Editá ese.`,
      };
    if (error.code === "PGRST116")
      return { ok: false, error: "No encontramos ese día. Recargá la página." };
    return { ok: false, error: friendly(error, "No pudimos guardar el día. Probá de nuevo.") };
  }

  saved();
  return { ok: true, data: undefined };
}

export async function deleteException(id: string): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "No encontramos ese día." };

  const { error } = await supabase.from("opening_exceptions").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error, "No pudimos eliminarlo. Probá de nuevo.") };

  saved();
  return { ok: true, data: undefined };
}

/** Borra los días especiales que ya pasaron. Devuelve cuántos. */
export async function purgePastExceptions(): Promise<ActionResult<number>> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const { data, error } = await supabase.rpc("purge_past_opening_exceptions");
  if (error) return { ok: false, error: friendly(error, "No pudimos borrarlos. Probá de nuevo.") };

  saved();
  return { ok: true, data: data ?? 0 };
}
