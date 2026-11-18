import { Coffee, HandPlatter, Martini, UtensilsCrossed, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import type { BrandIconName } from "@/components/shared/brand-icon";
import { cn } from "@/lib/utils";

import { MOMENTS, type DayMoment, type MomentDefinition } from "../moments";

/** Mismos íconos que las tarjetas de momentos de la home. */
export const MOMENT_ICONS: Record<DayMoment, BrandIconName> = {
  morning: "taza",
  midday: "plato",
  evening: "copa",
};

/**
 * Selector Todo · Mañana · Mediodía · Tarde / Noche.
 *
 * Son links comunes (sin JS propio): cambian `?momento=` con navegación del lado del
 * cliente, sin recargar la página, y atrás / adelante funcionan con el historial normal.
 * `scroll={false}`: la página no salta al cambiar el filtro.
 * En mobile, si no entra en el ancho, la fila se desliza horizontalmente.
 */
export function MomentFilter({
  active,
  hrefFor,
  specials,
  className,
}: {
  active: MomentDefinition | null;
  hrefFor: (moment: MomentDefinition | null) => string;
  /** Opción "Platos del día" (a la derecha de "Todo"); solo si hay platos publicados. */
  specials?: { href: string; active: boolean };
  className?: string;
}) {
  const options = [null, ...MOMENTS];

  return (
    <nav aria-label="Filtrar la carta por momento del día" className={className}>
      <div className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
        <ul className="mx-auto flex w-max gap-2">
          {options.map((moment) => {
            const isActive =
              !specials?.active && (moment?.value ?? null) === (active?.value ?? null);
            return (
              <Fragment key={moment?.param ?? "todo"}>
                <li>
                  <FilterLink href={hrefFor(moment)} active={isActive}>
                    {moment && <MomentChipIcon moment={moment.value} />}
                    {moment?.label ?? "Todo"}
                  </FilterLink>
                </li>
                {moment === null && specials && (
                  <li>
                    <FilterLink href={specials.href} active={specials.active}>
                      <HandPlatter aria-hidden strokeWidth={1.75} className="size-5 shrink-0" />
                      Platos del día
                    </FilterLink>
                  </li>
                )}
              </Fragment>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-300 ease-soft active:scale-[0.97]",
        active
          ? "border-espresso bg-espresso text-cream"
          : "border-border bg-card text-foreground hover:border-olive/50 hover:text-olive",
      )}
    >
      {children}
    </Link>
  );
}

/**
 * Íconos de los botones del filtro. Los del manual (BrandIcon) son ilustraciones de trazo
 * muy fino con un óvalo: a ~20 px se cortan. Acá van íconos de línea hechos para tamaño
 * chico, en el mismo estilo que "Platos del día". Los del manual siguen en tamaño grande.
 */
const MOMENT_CHIP_ICONS: Record<DayMoment, LucideIcon> = {
  morning: Coffee,
  midday: UtensilsCrossed,
  evening: Martini,
};

function MomentChipIcon({ moment }: { moment: DayMoment }) {
  const Icon = MOMENT_CHIP_ICONS[moment];
  return <Icon aria-hidden strokeWidth={1.75} className="size-5 shrink-0" />;
}
