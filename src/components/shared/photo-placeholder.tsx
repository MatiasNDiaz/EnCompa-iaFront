import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Placeholder ÚNICO para fotos que todavía no existen. Claramente identificable
 * ("Foto pendiente · <sección>") para que nadie lo confunda con contenido real.
 * Cuando el admin carga la foto desde el CMS, se reemplaza solo.
 */
export function PhotoPlaceholder({
  label,
  tone = "light",
  className,
}: {
  label: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Foto pendiente: ${label}`}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        tone === "light"
          ? "bg-secondary text-muted-foreground"
          : "bg-surface text-surface-foreground/80",
        className,
      )}
    >
      {/* Trama sutil con un tono de la paleta (no es una foto). */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, color-mix(in oklab, var(--color-caramel) 35%, transparent) 0 1px, transparent 1px 14px)",
        }}
      />
      <span className="eyebrow relative flex items-center gap-2 rounded-full bg-background/85 px-3 py-1.5 text-[0.65rem] tracking-[0.18em] text-foreground">
        <ImageIcon className="size-3.5" aria-hidden />
        Foto pendiente · {label}
      </span>
    </div>
  );
}
