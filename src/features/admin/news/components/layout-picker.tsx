"use client";

import { Check } from "lucide-react";

import { NEWS_CARD_LAYOUTS, type NewsCardLayout } from "@/features/news/types";
import { cn } from "@/lib/utils";

/**
 * Elegir el diseño de la tarjeta en /novedades: tres opciones con un dibujo de cada
 * estructura (Dividida · Apilada · Curva). Radios nativos: se maneja con teclado.
 */
export function LayoutPicker({
  name,
  value,
  onChange,
  disabled,
}: {
  name: string;
  value: NewsCardLayout;
  onChange: (value: NewsCardLayout) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-[0.95rem] font-medium">Diseño de la tarjeta</legend>
      <p className="-mt-1 text-sm text-muted-foreground">
        Cómo se ve en la lista de Novedades. En el celular la foto va siempre arriba.
      </p>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {NEWS_CARD_LAYOUTS.map((layout) => {
          const checked = value === layout.value;
          return (
            <label
              key={layout.value}
              className={cn(
                "relative flex cursor-pointer flex-col gap-2 rounded-2xl border bg-card p-2.5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-olive sm:p-3",
                checked ? "border-olive ring-2 ring-olive/25" : "border-caramel/30 hover:border-caramel/60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={layout.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(layout.value)}
                className="sr-only"
                aria-describedby={`${name}-${layout.value}`}
              />
              <Schematic layout={layout.value} />
              <span className="flex items-center justify-between gap-1 text-sm font-medium">
                {layout.label}
                {checked && <Check aria-hidden className="size-4 text-olive" />}
              </span>
              <span id={`${name}-${layout.value}`} className="sr-only">
                {layout.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Dibujo mínimo de cada estructura (foto en espresso, líneas de texto en caramelo). */
function Schematic({ layout }: { layout: NewsCardLayout }) {
  const lines = (
    <span className="flex flex-col gap-1">
      <span className="h-1 w-2/5 rounded-full bg-caramel/50" />
      <span className="h-2 w-4/5 rounded-full bg-espresso/70" />
      <span className="h-1 w-3/5 rounded-full bg-caramel/40" />
      <span className="h-1 w-1/3 rounded-full bg-olive/70" />
    </span>
  );

  return (
    <span
      aria-hidden
      className="relative block aspect-[16/10] overflow-hidden rounded-lg border border-caramel/20 bg-background"
    >
      {layout === "split" && (
        <span className="grid h-full grid-cols-[1.15fr_1fr]">
          <span className="m-1 rounded-md bg-[linear-gradient(135deg,var(--color-espresso),color-mix(in_oklab,var(--color-caramel)_60%,var(--color-espresso)))]" />
          <span className="flex items-center px-1.5">{lines}</span>
        </span>
      )}
      {layout === "stacked" && (
        <span className="flex h-full flex-col">
          <span className="h-[52%] bg-[linear-gradient(135deg,var(--color-espresso),color-mix(in_oklab,var(--color-caramel)_60%,var(--color-espresso)))]" />
          <span className="flex flex-1 items-center px-2">{lines}</span>
        </span>
      )}
      {layout === "curved" && (
        <span className="grid h-full grid-cols-[1fr_1fr]">
          <span className="bg-[linear-gradient(135deg,var(--color-espresso),color-mix(in_oklab,var(--color-caramel)_60%,var(--color-espresso)))] [clip-path:ellipse(100%_125%_at_0%_50%)]" />
          <span className="flex items-center px-1.5">{lines}</span>
        </span>
      )}
    </span>
  );
}
