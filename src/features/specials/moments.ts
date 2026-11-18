import { SPECIALS_SCHEDULE } from "@/config/specials";
import { MOMENTS, type DayMoment } from "@/features/menu/moments";

/** Plato del día listo para mostrar (web pública y vista previa del panel). */
export type DailySpecial = {
  moment: DayMoment;
  title: string;
  subtitle: string | null;
  body: string | null;
  price: number | null;
  /** Texto libre; null = no se muestra. */
  ingredients: string | null;
  /** URL pública de la foto (o una vista previa local en el panel). */
  imageUrl: string | null;
};

/** Mañana → mediodía → tarde/noche (orden en la carta y en el panel). */
export const SPECIAL_MOMENTS: readonly DayMoment[] = MOMENTS.map((m) => m.value);

export const momentLabel = (moment: DayMoment) =>
  MOMENTS.find((m) => m.value === moment)?.label ?? moment;

const hhmm = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

/** "06:00 a 12:00": horario de ese plato (se muestra junto a su título en la carta). */
export function scheduleLabel(moment: DayMoment): string {
  const index = SPECIAL_MOMENTS.indexOf(moment);
  const next = SPECIAL_MOMENTS[(index + 1) % SPECIAL_MOMENTS.length];
  return `${hhmm(SPECIALS_SCHEDULE[moment].from)} a ${hhmm(SPECIALS_SCHEDULE[next].from)}`;
}
