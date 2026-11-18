"use client";

import { CopyCheck } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toaster";
import { WEEKDAY_LABELS, type Weekday } from "@/features/hours/schemas";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { cn } from "@/lib/utils";

import { saveWeeklyHours } from "../actions";
import { validateWeek, type WeekDayValues } from "../schemas";
import { RangeFields } from "./range-fields";

const DEFAULT_RANGE = { open: "09:00", close: "23:00", nextDay: false };

/**
 * Horario de la semana: una tarjeta por día con "Abierto / Cerrado", sus horarios (hasta 2)
 * y "Copiar a todos los días". Se guarda todo junto con el botón de abajo.
 * Los errores aparecen después del primer intento de guardar y se actualizan solos.
 */
export function WeeklyHoursForm({ initial }: { initial: WeekDayValues[] }) {
  const confirm = useConfirm();
  const [days, setDays] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [tried, setTried] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(days) !== baseline;
  useUnsavedChanges(dirty);
  const errors = useMemo(() => (tried ? validateWeek(days) : {}), [tried, days]);

  const setDay = (day: Weekday, patch: Partial<WeekDayValues>) =>
    setDays((current) => current.map((d) => (d.day === day ? { ...d, ...patch } : d)));

  const copyToAll = async (source: WeekDayValues) => {
    const label = WEEKDAY_LABELS[source.day].toLowerCase();
    const ok = await confirm({
      title: `¿Copiar el horario del ${label} a todos los días?`,
      description: "Se reemplaza el horario de los otros seis días. Después tocá «Guardar horario».",
      confirmLabel: "Copiar",
      cancelLabel: "Cancelar",
    });
    if (!ok) return;
    setDays((current) =>
      current.map((d) => ({
        ...d,
        isOpen: source.isOpen,
        ranges: source.ranges.map((range) => ({ ...range })),
      })),
    );
  };

  const save = () => {
    setTried(true);
    if (Object.keys(validateWeek(days)).length > 0) {
      toast.error("Revisá los horarios", "Hay horarios marcados en rojo.");
      return;
    }
    startTransition(async () => {
      const result = await saveWeeklyHours(days);
      if (!result.ok) {
        toast.error("No se pudo guardar", result.error);
        return;
      }
      setBaseline(JSON.stringify(days));
      setTried(false);
      toast.success("Horario guardado", "Ya se ve en Ubicación y en el pie de la web.");
    });
  };

  return (
    <form
      noValidate
      aria-busy={pending || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {days.map((day) => {
          const label = WEEKDAY_LABELS[day.day];
          const dayError = errors[day.day];
          return (
            <li key={day.day} className="min-w-0">
              <section
                aria-label={label}
                className={cn(
                  "flex h-full flex-col gap-4 rounded-3xl border bg-card p-5 shadow-[0_12px_32px_-28px_rgb(72_54_41/0.5)]",
                  day.isOpen ? "border-caramel/30" : "border-dashed border-caramel/40",
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-serif text-[1.6rem] leading-none">{label}</h3>
                  <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[0.95rem] font-medium">
                    <span className={day.isOpen ? "text-olive" : "text-muted-foreground"}>
                      {day.isOpen ? "Abierto" : "Cerrado"}
                    </span>
                    <Switch
                      aria-label={`${label}: abierto`}
                      checked={day.isOpen}
                      disabled={pending}
                      onCheckedChange={(isOpen) =>
                        setDay(day.day, {
                          isOpen,
                          ranges:
                            isOpen && day.ranges.length === 0 ? [{ ...DEFAULT_RANGE }] : day.ranges,
                        })
                      }
                    />
                  </label>
                </div>

                {day.isOpen ? (
                  <RangeFields
                    ranges={day.ranges}
                    onChange={(ranges) => setDay(day.day, { ranges })}
                    errors={errors}
                    errorPrefix={`${day.day}.ranges`}
                    context={label}
                    disabled={pending}
                  />
                ) : (
                  <p className="text-[0.95rem] text-muted-foreground">Cerrado todo el día.</p>
                )}
                {dayError && <p className="text-sm text-destructive">{dayError}</p>}

                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void copyToAll(day)}
                  className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-olive underline-offset-4 hover:underline disabled:opacity-50"
                >
                  <CopyCheck aria-hidden className="size-4" />
                  Copiar a todos los días
                  <span className="sr-only"> (el horario del {label.toLowerCase()})</span>
                </button>
              </section>
            </li>
          );
        })}
      </ul>

      {/* Barra de guardado: queda a mano (encima de la barra inferior en el celular). */}
      <div
        data-sticky-save
        className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 mt-6 lg:bottom-6"
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-caramel/30 bg-card/95 px-4 py-3 shadow-[0_16px_40px_-20px_rgb(72_54_41/0.55)] backdrop-blur-sm">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {dirty ? "Tenés cambios sin guardar." : "El horario está guardado."}
          </p>
          <Button type="submit" className="h-12 px-6 text-base" disabled={pending || !dirty}>
            {pending ? "Guardando…" : "Guardar horario"}
          </Button>
        </div>
      </div>
    </form>
  );
}
