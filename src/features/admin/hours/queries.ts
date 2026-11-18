import "server-only";

import { cache } from "react";

import {
  openingExceptionSchema,
  openingHoursSchema,
  type OpeningException,
  type OpeningHours,
} from "@/features/hours/schemas";
import { requireAdmin } from "@/lib/auth/admin";
import { QueryError } from "@/lib/supabase/query-error";

/**
 * Horario semanal y TODOS los días especiales (también los pasados: la RLS se los deja
 * ver al admin), con la sesión del admin. Sin caché: siempre el estado real.
 */
export const getAdminHours = cache(
  async (): Promise<{ hours: OpeningHours | null; exceptions: OpeningException[] }> => {
    const { supabase } = await requireAdmin();
    const [settings, exceptions] = await Promise.all([
      supabase.from("site_settings").select("opening_hours").maybeSingle(),
      supabase.from("opening_exceptions").select("id, date, type, ranges, note").order("date"),
    ]);

    if (settings.error) throw new QueryError("el horario", settings.error);
    if (exceptions.error) throw new QueryError("los días especiales", exceptions.error);

    const hours = openingHoursSchema.safeParse(settings.data?.opening_hours);
    return {
      hours: hours.success ? hours.data : null,
      exceptions: exceptions.data.flatMap((row) => {
        const parsed = openingExceptionSchema.safeParse(row);
        return parsed.success ? [parsed.data] : [];
      }),
    };
  },
);
