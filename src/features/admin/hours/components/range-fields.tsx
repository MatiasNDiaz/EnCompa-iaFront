"use client";

import { Plus, Trash2 } from "lucide-react";
import { useId } from "react";

import { Button } from "@/components/ui/button";
import { MAX_RANGES, type FormRange } from "@/features/hours/schemas";
import { cn } from "@/lib/utils";

import type { RangeErrors } from "../schemas";

const NEW_SECOND_RANGE: FormRange = { open: "19:00", close: "23:00", nextDay: false };

/**
 * Las franjas de un día (hasta 2): "Abre" y "Cierra" con el selector de hora del sistema
 * (cómodo en el celular) y «Cierra al día siguiente» para los horarios de noche.
 * `errorPrefix` es el comienzo de las claves de error (`<prefix>.<i>.<campo>`).
 */
export function RangeFields({
  ranges,
  onChange,
  errors,
  errorPrefix,
  context,
  disabled = false,
}: {
  ranges: FormRange[];
  onChange: (ranges: FormRange[]) => void;
  errors: RangeErrors;
  errorPrefix: string;
  /** Para los lectores de pantalla: "Lunes", "el día especial". */
  context: string;
  disabled?: boolean;
}) {
  const baseId = useId();

  const update = (index: number, patch: Partial<FormRange>) =>
    onChange(ranges.map((range, i) => (i === index ? { ...range, ...patch } : range)));

  return (
    <div className="flex flex-col gap-3">
      {ranges.map((range, index) => {
        const key = (field: string) => `${errorPrefix}.${index}.${field}`;
        const messages = [errors[key("open")], errors[key("close")], errors[key("nextDay")]].filter(
          (m): m is string => Boolean(m),
        );
        const errorId = `${baseId}-${index}-error`;
        const describedBy = messages.length ? errorId : undefined;
        const ids = {
          open: `${baseId}-${index}-open`,
          close: `${baseId}-${index}-close`,
          nextDay: `${baseId}-${index}-next`,
        };

        return (
          <fieldset
            key={index}
            className={cn(
              "rounded-2xl border bg-background p-3 sm:p-4",
              messages.length ? "border-destructive/60" : "border-caramel/25",
            )}
          >
            <legend className="sr-only">
              {context}, {ranges.length > 1 ? `horario ${index + 1}` : "horario"}
            </legend>

            <div className="grid grid-cols-2 gap-3">
              <TimeInput
                id={ids.open}
                label="Abre"
                value={range.open}
                invalid={Boolean(errors[key("open")])}
                describedBy={describedBy}
                disabled={disabled}
                onChange={(open) => update(index, { open })}
              />
              <TimeInput
                id={ids.close}
                label="Cierra"
                value={range.close}
                invalid={Boolean(errors[key("close")])}
                describedBy={describedBy}
                disabled={disabled}
                onChange={(close) => update(index, { close })}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <label
                htmlFor={ids.nextDay}
                className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 text-[0.95rem]"
              >
                <input
                  id={ids.nextDay}
                  type="checkbox"
                  checked={range.nextDay}
                  disabled={disabled}
                  aria-invalid={Boolean(errors[key("nextDay")]) || undefined}
                  aria-describedby={describedBy}
                  onChange={(event) => update(index, { nextDay: event.target.checked })}
                  className="size-5 shrink-0 cursor-pointer rounded accent-olive"
                />
                <span>
                  Cierra al día siguiente{" "}
                  <span className="text-muted-foreground">(después de las 00:00)</span>
                </span>
              </label>
              {ranges.length > 1 && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(ranges.filter((_, i) => i !== index))}
                  aria-label={`Quitar el horario ${index + 1} (${context})`}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 aria-hidden className="size-5" />
                </button>
              )}
            </div>

            {messages.length > 0 && (
              <ul id={errorId} className="mt-1 flex flex-col gap-1 text-sm text-destructive">
                {[...new Set(messages)].map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            )}
          </fieldset>
        );
      })}

      {ranges.length < MAX_RANGES && (
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className="h-11 self-start px-4"
          onClick={() => onChange([...ranges, { ...NEW_SECOND_RANGE }])}
        >
          <Plus aria-hidden />
          {ranges.length === 0 ? "Agregar horario" : "Agregar otro horario"}
          {ranges.length > 0 && <span className="sr-only"> ({context})</span>}
        </Button>
      )}
    </div>
  );
}

function TimeInput({
  id,
  label,
  value,
  invalid,
  describedBy,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  invalid: boolean;
  describedBy?: string;
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="time"
        step={300}
        required
        value={value}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-base tabular-nums outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
      />
    </div>
  );
}
