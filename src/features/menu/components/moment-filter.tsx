import Link from "next/link";

import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";
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
  className,
}: {
  active: MomentDefinition | null;
  hrefFor: (moment: MomentDefinition | null) => string;
  className?: string;
}) {
  const options = [null, ...MOMENTS];

  return (
    <nav aria-label="Filtrar la carta por momento del día" className={className}>
      <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="mx-auto flex w-max gap-2">
          {options.map((moment) => {
            const isActive = (moment?.value ?? null) === (active?.value ?? null);
            return (
              <li key={moment?.param ?? "todo"}>
                <Link
                  href={hrefFor(moment)}
                  scroll={false}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-[background-color,border-color,color,transform] duration-300 ease-soft active:scale-[0.97]",
                    isActive
                      ? "border-espresso bg-espresso text-cream"
                      : "border-border bg-card text-foreground hover:border-olive/50 hover:text-olive",
                  )}
                >
                  {moment && (
                    <BrandIcon name={MOMENT_ICONS[moment.value]} className="h-4 w-5 shrink-0" />
                  )}
                  {moment?.label ?? "Todo"}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
