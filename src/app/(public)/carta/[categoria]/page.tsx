import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/reveal";
import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";
import { SITE } from "@/config/site";
import { getCategoryImage } from "@/features/menu/category-image";
import { CategoryBanner } from "@/features/menu/components/category-banner";
import { MOMENT_ICONS } from "@/features/menu/components/moment-filter";
import { ProductGrid, usesStockImages } from "@/features/menu/components/product-list";
import {
  cartaHref,
  filterCategoryByMoment,
  filterMenuByMoment,
  MOMENT_PARAM,
  parseMoment,
} from "@/features/menu/moments";
import { getMenu } from "@/features/menu/queries";

/** Ícono de marca para las tarjetas sin foto. */
const CATEGORY_ICONS: Record<string, BrandIconName> = {
  cafeteria: "taza",
  pasteleria: "taza",
  "desayunos-y-brunch": "taza",
  cocteleria: "copa",
};

/**
 * Una página por sección. Se renderiza por visita porque lee `?momento=`; los datos vienen
 * de la caché de fetch (tag `menu`), no de una consulta a Supabase en cada visita.
 * La canónica es siempre /carta/<slug>, sin el parámetro.
 */
export async function generateMetadata({
  params,
}: PageProps<"/carta/[categoria]">): Promise<Metadata> {
  const { categoria } = await params;
  const category = (await getMenu()).find((c) => c.slug === categoria);
  if (!category) return {};
  return {
    title: `${category.name} · Nuestra carta`,
    description: `${category.name} en la carta de ${SITE.name}, ${SITE.locality}.`,
    alternates: { canonical: `/carta/${category.slug}` },
  };
}

export default async function MenuCategoryPage({
  params,
  searchParams,
}: PageProps<"/carta/[categoria]">) {
  const [{ categoria }, query, menu] = await Promise.all([params, searchParams, getMenu()]);
  const index = menu.findIndex((c) => c.slug === categoria);
  if (index === -1) notFound();

  const requestedMoment = parseMoment(query[MOMENT_PARAM]);
  const fullCategory = menu[index];
  const filtered = requestedMoment
    ? filterCategoryByMoment(fullCategory, requestedMoment.value)
    : fullCategory;
  // Entró directo a una sección que no se sirve en ese momento: se muestra completa, con aviso.
  const outOfMoment = requestedMoment !== null && filtered === null;
  const moment = outOfMoment ? null : requestedMoment;
  const category = filtered ?? fullCategory;

  // Anterior / Siguiente solo entre las secciones del momento elegido.
  const sections = filterMenuByMoment(menu, moment);
  const position = sections.findIndex((c) => c.id === category.id);
  const previous = sections[position - 1];
  const next = sections[position + 1];

  const icon = CATEGORY_ICONS[category.slug] ?? "plato";
  const hasStock = usesStockImages([
    ...category.products,
    ...category.subcategories.flatMap((s) => s.products),
  ]);

  return (
    <>
      {/* "Volver" siempre visible arriba a la izquierda (fijo bajo el header). */}
      <div className="sticky top-(--header-height) z-20 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="container-site flex h-12 items-center justify-between gap-3">
          <Link
            href={cartaHref(undefined, moment)}
            className="group -ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold tracking-wide"
          >
            <ArrowLeft
              aria-hidden
              className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
            />
            Volver
          </Link>
          {moment && (
            <Link
              href={cartaHref(category.slug)}
              aria-label={`Quitar el filtro ${moment.label}: ver la sección completa`}
              className="-mr-1 inline-flex min-h-9 items-center gap-2 rounded-full border border-olive/30 bg-card py-1 pr-2.5 pl-3 text-xs font-semibold tracking-wide text-olive transition-colors hover:border-olive/60"
            >
              <BrandIcon name={MOMENT_ICONS[moment.value]} className="h-3.5 w-4" />
              Carta · {moment.label}
              <X aria-hidden className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      <CategoryBanner
        image={getCategoryImage(category, index)}
        title={category.name}
        subtitle={category.description}
        as="h1"
        eyebrow="Nuestra carta"
        size="hero"
        priority
      />

      <div className="container-site pt-8 pb-16 md:pt-14 md:pb-24">
        {outOfMoment && requestedMoment && (
          <p
            role="note"
            className="mb-8 rounded-2xl border border-olive/25 bg-card px-5 py-4 text-sm text-muted-foreground md:mb-12"
          >
            {category.name} no forma parte de la carta {requestedMoment.ofLabel}.{" "}
            <Link
              href={cartaHref(undefined, requestedMoment)}
              className="font-semibold text-olive underline decoration-olive/40 underline-offset-4 hover:decoration-olive"
            >
              Ver la carta {requestedMoment.ofLabel}
            </Link>
          </p>
        )}
        <div>
          {category.products.length > 0 && <ProductGrid products={category.products} icon={icon} />}

          {category.subcategories.map((sub) => (
            <section
              key={sub.id}
              aria-labelledby={`sub-${sub.slug}`}
              className="mt-12 first:mt-0 md:mt-16"
            >
              <Reveal className="mb-5 flex items-center gap-4">
                <h2 id={`sub-${sub.slug}`} className="text-h3 text-olive">
                  {sub.name}
                </h2>
                <span aria-hidden className="h-px flex-1 bg-olive/25" />
                <span className="text-sm text-muted-foreground tabular-nums">
                  {sub.products.length}
                </span>
              </Reveal>
              {sub.description && (
                <p className="mb-4 text-sm text-muted-foreground">{sub.description}</p>
              )}
              <ProductGrid products={sub.products} icon={icon} />
            </section>
          ))}

          {hasStock && (
            <p className="mt-12 text-xs text-muted-foreground">
              Las imágenes de los productos son ilustrativas.
            </p>
          )}
        </div>
      </div>

      {/* Navegación entre secciones: anterior / siguiente. */}
      <nav aria-label="Otras secciones de la carta" className="container-site pb-20 md:pb-28">
        <div className="grid gap-3 border-t border-border pt-8 sm:grid-cols-2">
          {previous ? (
            <Link
              href={cartaHref(previous.slug, moment)}
              className="group -ml-4 flex flex-col rounded-2xl p-4 transition-colors hover:bg-secondary"
            >
              <span className="eyebrow flex items-center gap-2 text-olive">
                <ArrowLeft aria-hidden className="size-3.5" /> Anterior
              </span>
              <span className="mt-1 font-serif text-h3">{previous.name}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              href={cartaHref(next.slug, moment)}
              className="group -mr-4 flex flex-col rounded-2xl p-4 text-right transition-colors hover:bg-secondary sm:col-start-2"
            >
              <span className="eyebrow flex items-center justify-end gap-2 text-olive">
                Siguiente <ArrowRight aria-hidden className="size-3.5" />
              </span>
              <span className="mt-1 font-serif text-h3">{next.name}</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
