import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

export type BrandIconName = "taza" | "copa" | "plato" | "monograma-ec";

/**
 * Íconos lineales del manual (separados de `iconos-claros.svg` sin alterar trazados).
 *
 * Se dibujan como MÁSCARA CSS del archivo SVG pintada con `currentColor`:
 * - toman el color del texto (crema sobre oscuro, terracota/espresso sobre crema);
 * - el SVG se descarga una vez y queda en caché. Insertarlos inline sumaba ~20 KB por
 *   ícono al HTML y al payload de hidratación (subía el TBT en mobile).
 * Son decorativos.
 */
export function BrandIcon({ name, className }: { name: BrandIconName; className?: string }) {
  const style = {
    "--icon": `url(/brand/icons/${name}.svg)`,
  } as CSSProperties;

  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "inline-block bg-current [mask-image:var(--icon)] [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat]",
        className,
      )}
    />
  );
}
