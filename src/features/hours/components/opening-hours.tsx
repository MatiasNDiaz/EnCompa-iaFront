import { CalendarClock } from "lucide-react";

import { formatDayDate, weekdayOf } from "@/lib/time";
import { cn } from "@/lib/utils";

import { exceptionHours, upcomingExceptions, weekRows } from "../format";
import type { OpeningException, OpeningHours } from "../schemas";

/**
 * Horarios en Ubicación: días especiales de los próximos 7 días (arriba, destacados) y la
 * tabla semanal con hoy resaltado. `today` es la fecha del local (YYYY-MM-DD).
 * Sin horario cargado, `fallback`.
 */
export function OpeningHoursBlock({
  hours,
  exceptions,
  today,
  fallback,
}: {
  hours: OpeningHours | null;
  exceptions: OpeningException[];
  today: string;
  fallback: React.ReactNode;
}) {
  const rows = weekRows(hours);
  const upcoming = upcomingExceptions(exceptions, today);
  const todayKey = weekdayOf(today);

  return (
    <div className="flex flex-col gap-6">
      {upcoming.length > 0 && (
        <section aria-label="Días especiales" className="rounded-2xl bg-olive/[0.08] p-5">
          <p className="eyebrow mb-3 flex items-center gap-2 text-olive">
            <CalendarClock aria-hidden className="size-4" />
            Días especiales
          </p>
          <ul className="flex flex-col gap-3 text-base">
            {upcoming.map((exception) => (
              <li key={exception.id}>
                <p>
                  <span className="font-semibold">
                    {exception.date === today ? "Hoy" : formatDayDate(exception.date)}
                  </span>
                  : {exceptionHours(exception).toLowerCase()}
                </p>
                {exception.note && (
                  <p className="font-serif text-lg leading-snug text-olive italic">
                    {exception.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {rows ? (
        <dl className="grid grid-cols-[auto_1fr] gap-y-1">
          {rows.map((row) => {
            const isToday = row.day === todayKey;
            return (
              <div
                key={row.day}
                aria-current={isToday ? "date" : undefined}
                className={cn(
                  "col-span-2 grid grid-cols-subgrid items-baseline gap-x-6 rounded-xl px-3 py-1.5",
                  isToday && "bg-olive text-cream",
                )}
              >
                <dt className={cn("font-medium", isToday && "font-semibold")}>
                  {row.label}
                  {isToday && <span className="sr-only"> (hoy)</span>}
                </dt>
                <dd
                  className={cn(
                    "flex items-baseline justify-between gap-3 tabular-nums",
                    isToday ? "text-cream" : "text-muted-foreground",
                  )}
                >
                  {row.value}
                  {isToday && (
                    <span
                      aria-hidden
                      className="text-[0.65rem] font-semibold tracking-[0.16em] uppercase"
                    >
                      Hoy
                    </span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        fallback
      )}
    </div>
  );
}
