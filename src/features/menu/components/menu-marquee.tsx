import { Fragment } from "react";

import { SteamingCup } from "./steaming-cup";

/**
 * Cinta de la carta (referencia del cliente): las secciones reales de la carta pasando de
 * derecha a izquierda, separadas por una taza humeante. Decorativa: la navegación real son
 * los banners de categoría, así que se oculta a lectores de pantalla.
 */
export function MenuMarquee({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  // Se repite la lista para cubrir pantallas anchas; la pista lleva 2 copias idénticas.
  const sequence = [...items, ...items];
  const group = (copy: number) => (
    <div className="flex shrink-0 items-center" key={copy}>
      {sequence.map((label, i) => (
        <Fragment key={`${copy}-${i}`}>
          <span className="px-6 text-[0.8rem] font-semibold tracking-[0.26em] whitespace-nowrap uppercase sm:px-8">
            {label}
          </span>
          <SteamingCup className="size-[1.15rem] shrink-0 text-caramel" />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div
      aria-hidden
      className="marquee overflow-hidden border-y border-cream/10 bg-surface py-3 text-surface-foreground"
    >
      <div className="marquee-track flex w-max">{[group(0), group(1)]}</div>
    </div>
  );
}
