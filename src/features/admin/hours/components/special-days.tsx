"use client";

import { CalendarPlus, PencilLine, Trash2 } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useTransition } from "react";

import { describedBy } from "@/features/admin/menu/components/form-field";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Input } from "@/components/ui/input";
import { Sheet, SheetBody, SheetFooter } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toaster";
import { exceptionHours } from "@/features/hours/format";
import { MAX_NOTE_LENGTH, type OpeningException } from "@/features/hours/schemas";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { addDays, formatDayDate } from "@/lib/time";
import { cn } from "@/lib/utils";

import { deleteException, purgePastExceptions, saveException } from "../actions";
import { toFormRanges, validateException, type ExceptionValues } from "../schemas";
import { RangeFields } from "./range-fields";

const DEFAULT_RANGE = { open: "09:00", close: "23:00", nextDay: false };

const relativeDay = (date: string, today: string) =>
  date === today ? "Hoy" : date === addDays(today, 1) ? "Mañana" : null;

/**
 * Días especiales: la lista de los próximos (de hoy en adelante) con editar y eliminar,
 * "Agregar día especial" (panel lateral) y la limpieza de los que ya pasaron.
 * `today` es la fecha del local (YYYY-MM-DD).
 */
export function SpecialDays({
  exceptions,
  today,
}: {
  exceptions: OpeningException[];
  today: string;
}) {
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<{ exception: OpeningException | null; key: number } | null>(
    null,
  );
  const [open, setOpen] = useState(false);
  const counter = useRef(0);
  const dirtyRef = useRef(false);
  const setDirty = useCallback((dirty: boolean) => {
    dirtyRef.current = dirty;
  }, []);

  const upcoming = exceptions.filter((e) => e.date >= today);
  const pastCount = exceptions.length - upcoming.length;

  const edit = (exception: OpeningException | null) => {
    counter.current += 1;
    dirtyRef.current = false;
    setEditing({ exception, key: counter.current });
    setOpen(true);
  };

  const close = useCallback(() => {
    dirtyRef.current = false;
    setOpen(false);
  }, []);

  const requestClose = useCallback(async () => {
    if (
      dirtyRef.current &&
      !(await confirm({
        title: "¿Descartar los cambios?",
        description: "Tenés cambios sin guardar. Si cerrás ahora se pierden.",
        confirmLabel: "Descartar",
        cancelLabel: "Seguir editando",
        tone: "danger",
      }))
    ) {
      return;
    }
    close();
  }, [confirm, close]);

  const remove = async (exception: OpeningException) => {
    const ok = await confirm({
      title: `¿Eliminar el ${formatDayDate(exception.date, true).toLowerCase()}?`,
      description: "Ese día vuelve a tener el horario de la semana.",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await deleteException(exception.id);
      if (!result.ok) toast.error("No se pudo eliminar", result.error);
      else toast.success("Día especial eliminado", "Ese día vuelve al horario de la semana.");
    });
  };

  const purge = () =>
    startTransition(async () => {
      const result = await purgePastExceptions();
      if (!result.ok) toast.error("No se pudieron borrar", result.error);
      else toast.success("Listo", `Se borraron ${result.data} días que ya pasaron.`);
    });

  return (
    <>
      <div className="flex flex-col gap-4">
        <Button type="button" className="h-12 self-start px-5 text-base" onClick={() => edit(null)}>
          <CalendarPlus aria-hidden />
          Agregar día especial
        </Button>

        {upcoming.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-caramel/40 bg-card px-5 py-8 text-center text-[0.95rem] text-muted-foreground">
            No hay días especiales cargados. Agregá uno si un día cerrás o abrís con otro horario
            (un feriado, un evento, la lluvia).
          </p>
        ) : (
          <ul aria-label="Próximos días especiales" className="flex flex-col gap-3" aria-busy={pending || undefined}>
            {upcoming.map((exception) => {
              const relative = relativeDay(exception.date, today);
              return (
                <li
                  key={exception.id}
                  className="flex flex-col gap-3 rounded-3xl border border-caramel/30 bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="font-serif text-[1.45rem] leading-tight">
                        {formatDayDate(exception.date, true)}
                      </span>
                      {relative && (
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                          {relative}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-[0.95rem]">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          exception.type === "closed"
                            ? "bg-vermouth/10 text-vermouth"
                            : "bg-olive/10 text-olive",
                        )}
                      >
                        {exception.type === "closed" ? "Cerrado" : "Horario distinto"}
                      </span>
                      {exception.type === "custom" && (
                        <span className="tabular-nums">{exceptionHours(exception)}</span>
                      )}
                    </p>
                    {exception.note && (
                      <p className="mt-1 text-[0.95rem] text-muted-foreground">
                        «{exception.note}»
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 px-4"
                      disabled={pending}
                      onClick={() => edit(exception)}
                    >
                      <PencilLine aria-hidden />
                      Editar
                      <span className="sr-only"> el {formatDayDate(exception.date, true)}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-11 px-3 text-vermouth hover:bg-vermouth/10 hover:text-vermouth"
                      disabled={pending}
                      onClick={() => void remove(exception)}
                    >
                      <Trash2 aria-hidden />
                      Eliminar
                      <span className="sr-only"> el {formatDayDate(exception.date, true)}</span>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {pastCount > 0 && (
          <button
            type="button"
            disabled={pending}
            onClick={purge}
            className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
          >
            <Trash2 aria-hidden className="size-4" />
            Borrar {pastCount === 1 ? "1 día que ya pasó" : `${pastCount} días que ya pasaron`}
          </button>
        )}
      </div>

      <Sheet
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : void requestClose())}
        title={editing?.exception ? "Editar día especial" : "Nuevo día especial"}
        description="Ese día reemplaza al horario de la semana. Se ve en Ubicación."
      >
        {editing && (
          <ExceptionForm
            key={editing.key}
            exception={editing.exception}
            today={today}
            onDirtyChange={setDirty}
            onDone={close}
            onCancel={() => void requestClose()}
          />
        )}
      </Sheet>
    </>
  );
}

function ExceptionForm({
  exception,
  today,
  onDirtyChange,
  onDone,
  onCancel,
}: {
  exception: OpeningException | null;
  today: string;
  onDirtyChange: (dirty: boolean) => void;
  onDone: () => void;
  onCancel: () => void;
}) {
  const ids = { date: useId(), note: useId(), type: useId() };
  const initial = useMemo<ExceptionValues>(
    () => ({
      date: exception?.date ?? "",
      type: exception?.type ?? "closed",
      ranges: exception?.type === "custom" ? toFormRanges(exception.ranges) : [{ ...DEFAULT_RANGE }],
      note: exception?.note ?? "",
    }),
    [exception],
  );
  const [values, setValues] = useState(initial);
  const [tried, setTried] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);
  useUnsavedChanges(dirty);
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  const errors = tried ? validateException(values, today) : {};
  const set = (patch: Partial<ExceptionValues>) => setValues((v) => ({ ...v, ...patch }));

  const submit = () => {
    setTried(true);
    setServerError(null);
    if (Object.keys(validateException(values, today)).length > 0) return;
    startTransition(async () => {
      const result = await saveException(exception?.id ?? null, values);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      onDirtyChange(false);
      toast.success(
        exception ? "Día especial guardado" : "Día especial agregado",
        `${formatDayDate(values.date, true)}: ya se ve en Ubicación.`,
      );
      onDone();
    });
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <SheetBody className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor={ids.date} className="text-[0.95rem] font-medium">
            Fecha
          </label>
          <input
            id={ids.date}
            type="date"
            min={today}
            required
            value={values.date}
            disabled={pending}
            aria-invalid={Boolean(errors.date) || undefined}
            aria-describedby={describedBy(ids.date, errors.date)}
            onChange={(event) => set({ date: event.target.value })}
            className="h-12 w-full rounded-xl border border-input bg-card px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:max-w-xs"
          />
          {errors.date && (
            <p id={`${ids.date}-error`} className="text-sm text-destructive">
              {errors.date}
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 text-[0.95rem] font-medium">Ese día</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["closed", "Cerrado", "No abre en todo el día."],
                ["custom", "Horario distinto", "Abre con otro horario."],
              ] as const
            ).map(([type, title, description]) => (
              <label
                key={type}
                className={cn(
                  "flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border bg-card px-4 py-3 transition-colors",
                  values.type === type ? "border-olive ring-2 ring-olive/25" : "border-caramel/30",
                )}
              >
                <input
                  type="radio"
                  name={ids.type}
                  value={type}
                  checked={values.type === type}
                  disabled={pending}
                  onChange={() => set({ type })}
                  className="mt-1 size-5 shrink-0 accent-olive"
                />
                <span>
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm text-muted-foreground">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {values.type === "custom" && (
          <div className="flex flex-col gap-2">
            <p className="text-[0.95rem] font-medium">Horario de ese día</p>
            <RangeFields
              ranges={values.ranges}
              onChange={(ranges) => set({ ranges })}
              errors={errors}
              errorPrefix="ranges"
              context="Día especial"
              disabled={pending}
            />
            {errors.ranges && <p className="text-sm text-destructive">{errors.ranges}</p>}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor={ids.note} className="text-[0.95rem] font-medium">
            Nota para la web
          </label>
          <Input
            id={ids.note}
            value={values.note}
            maxLength={MAX_NOTE_LENGTH}
            autoComplete="off"
            disabled={pending}
            placeholder="Cerrado por lluvia"
            aria-invalid={Boolean(errors.note) || undefined}
            aria-describedby={describedBy(ids.note, errors.note, true)}
            onChange={(event) => set({ note: event.target.value })}
            className="h-12 text-base"
          />
          {errors.note ? (
            <p id={`${ids.note}-error`} className="text-sm text-destructive">
              {errors.note}
            </p>
          ) : (
            <p id={`${ids.note}-hint`} className="text-sm text-muted-foreground">
              Opcional. Por ejemplo «Abierto hasta tarde por la Noche de chicas». {values.note.length}/
              {MAX_NOTE_LENGTH}
            </p>
          )}
        </div>

        {serverError && (
          <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {serverError}
          </p>
        )}
      </SheetBody>

      <SheetFooter>
        <Button
          type="button"
          variant="ghost"
          className="hidden h-12 px-5 text-base sm:inline-flex"
          onClick={onCancel}
          disabled={pending}
        >
          Cancelar
        </Button>
        <Button type="submit" className="h-12 px-6 text-base" disabled={pending}>
          {pending ? "Guardando…" : exception ? "Guardar cambios" : "Agregar día especial"}
        </Button>
      </SheetFooter>
    </form>
  );
}
