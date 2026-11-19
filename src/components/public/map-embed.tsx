"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Mapa de Google que se carga recién al tocarlo. El iframe de Maps baja más de 1 MB de
 * JavaScript y cookies de terceros: no tiene sentido pagarlo en cada visita a Ubicación
 * (el botón «Cómo llegar» ya lleva a Google Maps).
 */
export function MapEmbed({
  src,
  title,
  address,
  className,
}: {
  src: string;
  title: string;
  address?: string | null;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <iframe
        src={src}
        title={title}
        referrerPolicy="no-referrer-when-downgrade"
        className={cn("w-full rounded-2xl border border-border", className)}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "group relative flex w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-border bg-secondary/70 p-8 text-center transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-olive",
        className,
      )}
    >
      {/* Trama de calles, solo decorativa. */}
      <span
        aria-hidden
        className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <span className="relative flex size-16 items-center justify-center rounded-full bg-cream shadow-[0_12px_30px_-18px_rgb(72_54_41/0.6)] transition-transform duration-300 group-hover:-translate-y-0.5">
        <MapPin aria-hidden className="size-7 text-terracotta" />
      </span>
      <span className="relative flex flex-col gap-1.5">
        <span className="font-serif text-h3">Ver mapa</span>
        {address && <span className="text-sm text-muted-foreground">{address}</span>}
        <span className="text-xs text-muted-foreground">Se abre Google Maps acá mismo.</span>
      </span>
    </button>
  );
}
