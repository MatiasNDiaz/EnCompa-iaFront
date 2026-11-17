import Image, { type StaticImageData } from "next/image";

import { LOCAL_PRODUCT_PHOTOS } from "@/assets/local";
import { MENU_PRODUCT_IMAGES } from "@/assets/menu/products";
import { Reveal } from "@/components/motion/reveal";
import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";
import { staggerDelay } from "@/config/motion";
import { getMediaUrl } from "@/lib/storage/media";
import { cn } from "@/lib/utils";

import type { MenuProduct } from "../queries";

const priceFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/** "$8.500" (sin el espacio que agrega Intl para es-AR, como en la referencia). */
const formatPrice = (value: number) => priceFormat.format(value).replace(/\s/g, "");

/** Foto del CMS → foto real del local → foto de banco CC0 (ilustrativa) → ninguna. */
function productImage(
  product: MenuProduct,
): { src: string | StaticImageData; isStock: boolean } | null {
  const url = getMediaUrl(product.image_path);
  if (url) return { src: url, isStock: false };
  const local = LOCAL_PRODUCT_PHOTOS[product.slug];
  if (local) return { src: local, isStock: false };
  const stock = MENU_PRODUCT_IMAGES[product.slug];
  return stock ? { src: stock, isStock: true } : null;
}

/** ¿Alguna tarjeta muestra una foto de banco? (para el aviso "imágenes ilustrativas"). */
export function usesStockImages(products: MenuProduct[]) {
  return products.some((p) => productImage(p)?.isStock);
}

/**
 * Grilla de tarjetas de producto (referencia del cliente). Descripción, ingredientes y
 * precio aparecen solo si existen (se cargan desde el CMS; nada inventado).
 */
export function ProductGrid({ products, icon }: { products: MenuProduct[]; icon: BrandIconName }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {products.map((product, i) => (
        <Reveal as="li" key={product.id} delay={staggerDelay(i)} className="h-full">
          <ProductCard product={product} icon={icon} />
        </Reveal>
      ))}
    </ul>
  );
}

function ProductCard({ product, icon }: { product: MenuProduct; icon: BrandIconName }) {
  const image = productImage(product);

  return (
    <article
      className={cn(
        "group relative isolate flex h-full flex-col overflow-hidden rounded-3xl border border-caramel/35 bg-card",
        "transition-[transform,box-shadow,border-color] duration-500 ease-soft",
        "hover:-translate-y-1 hover:border-olive/40 hover:shadow-[0_22px_44px_-28px_rgb(72_54_41/0.55)]",
      )}
    >
      {/* Foto a sangre: ocupa todo el ancho de la tarjeta; las esquinas de arriba las recorta
          la propia tarjeta y el zoom del hover queda adentro (overflow-hidden). */}
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        {image ? (
          <Image
            src={image.src}
            alt="" // el nombre del producto ya está escrito debajo
            fill
            sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            placeholder={typeof image.src === "string" ? "empty" : "blur"}
            className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.05]"
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "flex h-full items-center justify-center",
              product.is_featured
                ? "bg-olive"
                : "bg-[color-mix(in_oklab,var(--color-olive)_10%,var(--color-cream))]",
            )}
          >
            <BrandIcon
              name={icon}
              className={cn(
                "h-16 w-24 transition-transform duration-700 ease-soft group-hover:scale-110",
                product.is_featured ? "text-cream" : "text-olive/70",
              )}
            />
          </div>
        )}
        {product.is_featured && (
          <span className="absolute top-4 left-4 rounded-full bg-cream/95 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.14em] text-olive uppercase">
            De la casa
          </span>
        )}
      </div>

      <div className="relative flex flex-1 flex-col px-6 pt-6 pb-6 sm:px-7">
        {/* Ramito decorativo: entra desde la esquina inferior derecha, detrás del texto. */}
        <LeafSprig className="pointer-events-none absolute -right-9 -bottom-4 h-40 w-30 -scale-x-100 text-caramel/35" />

        <h3 className="relative font-serif text-[1.95rem] leading-[1.05] font-bold">
          {product.name}
        </h3>
        {product.description && (
          <p className="relative mt-3 leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        {product.ingredients && (
          // La lista arranca en la misma línea que la hoja (alineada a la izquierda).
          <div className="relative mt-4 border-t border-caramel/40 pt-4">
            <p className="flex items-center gap-2.5">
              <LeafIcon className="size-5 shrink-0" />
              <span className="eyebrow text-olive">Ingredientes</span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {product.ingredients}
            </p>
          </div>
        )}

        <div className="relative mt-auto pt-5">
          {product.price !== null ? (
            <p className="font-serif text-[2.25rem] leading-none font-bold tabular-nums">
              {formatPrice(product.price)}
            </p>
          ) : (
            // Sin precio cargado: no se inventa; se avisa con discreción.
            <p className="font-serif text-lg text-muted-foreground italic">Precio a confirmar</p>
          )}
        </div>
      </div>
    </article>
  );
}

/** Hoja de "Ingredientes": relleno verde suave y contorno oliva. */
function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("text-olive", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M5 19C4 11 9 4 20 4c0 10-6 16-15 15Z"
        className="fill-[color-mix(in_oklab,var(--color-olive)_30%,var(--color-cream))]"
      />
      <path d="M5 19c4-5 8-9 12.5-12M3 21l2-2" />
    </svg>
  );
}

/**
 * Hojas lanceoladas del ramito: [x, y, ángulo, largo, ancho] sobre el tallo.
 * Alternan a cada lado y se achican hacia la punta.
 */
const SPRIG_LEAVES: [number, number, number, number, number][] = [
  [26, 136, -128, 40, 10],
  [31, 124, -12, 42, 10.5],
  [42, 100, -132, 38, 9.5],
  [50, 86, -18, 38, 9.5],
  [63, 64, -136, 33, 8.5],
  [72, 51, -24, 32, 8],
  [86, 31, -140, 26, 7],
  [97, 16, -52, 24, 6.5],
];

const leafPath = (l: number, w: number) =>
  `M0 0C${l * 0.28} ${-w} ${l * 0.7} ${-w * 0.85} ${l} 0C${l * 0.7} ${w * 0.85} ${l * 0.28} ${w} 0 0Z`;

/**
 * Ramito de hojas decorativo (trazo lineal fino), como la referencia del cliente:
 * tallo curvo con hojas alargadas, cada una con su nervadura central.
 */
function LeafSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M16 158C24 126 42 92 99 14" />
      {SPRIG_LEAVES.map(([x, y, angle, length, width]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${angle})`}>
          <path d={leafPath(length, width)} />
          <path d={`M0 0Q${length * 0.5} ${width * 0.12} ${length * 0.9} 0`} />
        </g>
      ))}
    </svg>
  );
}
