import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Etiqueta + control + ayuda + error, en una columna (formularios del panel). */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-[0.95rem] font-medium">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Interruptor con texto: toda la fila es clickeable. */
export function SwitchRow({
  title,
  description,
  control,
}: {
  title: string;
  description?: string;
  control: ReactNode;
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-5 rounded-2xl border border-caramel/30 bg-card px-4 py-3">
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
        {description && <span className="block text-sm text-muted-foreground">{description}</span>}
      </span>
      {control}
    </label>
  );
}

export const describedBy = (id: string, error?: string, hint?: boolean) =>
  [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null].filter(Boolean).join(" ") ||
  undefined;
