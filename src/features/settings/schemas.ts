import { z } from "zod";

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Formato HH:MM." });

/**
 * Forma de `site_settings.opening_hours` (jsonb). La base solo exige que sea un arreglo;
 * la forma de cada día se valida acá, en el CMS y en el servidor.
 * Un día sin franjas = cerrado. Permite turno cortado (varias franjas por día).
 */
export const openingHoursSchema = z
  .array(
    z.object({
      day: z.enum(WEEKDAYS),
      ranges: z.array(z.object({ open: time, close: time })).max(3),
    }),
  )
  .max(7);

export type OpeningHours = z.infer<typeof openingHoursSchema>;
