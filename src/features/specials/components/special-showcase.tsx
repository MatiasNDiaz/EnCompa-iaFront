import Image from "next/image";
import type { CSSProperties } from "react";

import { BRAND_IMAGES } from "@/assets/brand";
import { BrandIcon } from "@/components/shared/brand-icon";
import { MOMENT_ICONS } from "@/features/menu/components/moment-filter";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

import { momentLabel, type DailySpecial } from "../moments";

/** Orden de entrada escalonada (ver la cortina en globals.css). */
const item = (index: number) => ({
  "data-curtain-item": "",
  style: { "--curtain-i": index } as CSSProperties,
});

/**
 * Un plato del día. Es el MISMO componente en la home y en la vista previa del panel:
 * el diseño se adapta al ancho de su contenedor (container queries), no al de la pantalla,
 * así la vista previa dentro del panel lateral se ve como en un celular.
 *   - angosto: foto arriba, texto abajo;
 *   - ancho (@3xl): foto a la izquierda, texto a la derecha.
 */
export function SpecialShowcase({
  special,
  className,
  /** Vista previa del panel: la foto puede ser local (blob:), sin optimizar. */
  preview = false,
  /** Primer plato visible al cargar (carta → "Platos del día"). */
  priority = false,
}: {
  special: DailySpecial;
  className?: string;
  preview?: boolean;
  priority?: boolean;
}) {
  const label = momentLabel(special.moment);

  return (
    <article
      className={cn(
        "@container relative isolate flex overflow-hidden rounded-[2rem] bg-espresso text-white",
        className,
      )}
    >
      {/* Fondo: papel espresso del manual (como una carta de menú) con un velo cálido. */}
      <Image
        src={BRAND_IMAGES.texturaEspresso}
        alt=""
        fill
        // Original (909 px, ~100 KB) sin recomprimir: el optimizador lo achicaba y el grano
        // del papel se veía borroso al estirarlo sobre la tarjeta.
        unoptimized
        className="-z-10 object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-espresso/25" />

      <div className="flex w-full flex-col @3xl:grid @3xl:grid-cols-[1.1fr_1fr]">
        <div
          data-curtain-image=""
          className="relative min-h-[18rem] flex-1 overflow-hidden bg-[color-mix(in_oklab,var(--color-espresso)_80%,var(--color-olive))] @3xl:min-h-0"
        >
          {special.imageUrl ? (
            <Image
              src={special.imageUrl}
              alt={special.title}
              fill
              unoptimized={preview}
              priority={priority}
              sizes="(min-width: 1024px) 46rem, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-cream/40">
              <BrandIcon name={MOMENT_ICONS[special.moment]} className="h-20 w-28" />
            </div>
          )}
          {/* Fundido hacia el texto (solo en la versión apilada). */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-[rgb(56_47_42)] to-transparent @3xl:hidden"
          />
        </div>

        <div className="relative flex flex-col justify-center px-7 pt-2 pb-8 @md:px-9 @3xl:px-12 @3xl:py-11">
          <p {...item(0)} className="eyebrow flex items-center gap-3 text-caramel">
            <BrandIcon
              name={MOMENT_ICONS[special.moment]}
              className="h-8 w-10 shrink-0 text-caramel @3xl:h-9 @3xl:w-12"
            />
            Plato del día · {label}
          </p>
          <h3
            {...item(1)}
            className="mt-4 font-serif text-[2.25rem] leading-[1.02] font-medium @3xl:text-[3.1rem]"
          >
            {special.title}
          </h3>
          {special.subtitle && (
            <p
              {...item(2)}
              className="mt-3 font-serif text-[1.25rem] leading-snug text-white/95 italic @3xl:text-[1.45rem]"
            >
              {special.subtitle}
            </p>
          )}
          {special.body && (
            <p
              {...item(3)}
              className="mt-5 max-w-prose leading-relaxed whitespace-pre-line text-white/90"
            >
              {special.body}
            </p>
          )}
          {special.ingredients && (
            <div {...item(4)} className="mt-6 border-t border-white/20 pt-5">
              <p className="eyebrow text-caramel">Ingredientes</p>
              <p className="mt-2.5 max-w-prose text-sm leading-relaxed whitespace-pre-line text-white/90">
                {special.ingredients}
              </p>
            </div>
          )}
          {special.price !== null && (
            <p
              {...item(5)}
              className="mt-6 font-serif text-[2.15rem] leading-none font-semibold text-white tabular-nums"
            >
              {formatPrice(special.price)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
