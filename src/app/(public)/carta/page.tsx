import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/public/page-header";
import { staggerDelay } from "@/config/motion";
import { SITE } from "@/config/site";
import {
  SPECIALS_HREF,
  SPECIALS_LIST_ID,
  SPECIALS_VIEW,
  SPECIALS_VIEW_PARAM,
} from "@/config/specials";
import { getSiteContent } from "@/features/institutional/queries";
import { getCategoryImage } from "@/features/menu/category-image";
import { CategoryBanner } from "@/features/menu/components/category-banner";
import { MomentFilter } from "@/features/menu/components/moment-filter";
import {
  cartaHref,
  filterMenuByMoment,
  MOMENT_PARAM,
  momentTagline,
  parseMoment,
} from "@/features/menu/moments";
import { getMenu } from "@/features/menu/queries";
import { SpecialsList } from "@/features/specials/components/specials-list";
import { getPublishedSpecials } from "@/features/specials/queries";

const DESCRIPTION = `Carta de ${SITE.name}: cafetería, desayunos y brunch, pastelería, almuerzos, tapas, postres y coctelería.`;

/**
 * La URL canónica es siempre /carta: las variantes ?momento= no compiten en buscadores
 * (y no figuran en el sitemap).
 */
export async function generateMetadata({ searchParams }: PageProps<"/carta">): Promise<Metadata> {
  const query = await searchParams;
  const moment = parseMoment(query[MOMENT_PARAM]);
  return {
    title:
      query[SPECIALS_VIEW_PARAM] === SPECIALS_VIEW
        ? "Platos del día"
        : moment
          ? `Carta ${moment.ofLabel}`
          : "Nuestra carta",
    description: DESCRIPTION,
    alternates: { canonical: "/carta" },
  };
}

/**
 * Índice de la carta: un banner fotográfico por sección; cada uno lleva a su detalle.
 * `?momento=manana|mediodia|tarde-noche` muestra solo lo que se sirve en ese momento;
 * un valor inválido o ausente muestra la carta completa.
 */
export default async function MenuPage({ searchParams }: PageProps<"/carta">) {
  const [menu, content, specials, query] = await Promise.all([
    getMenu(),
    getSiteContent(),
    getPublishedSpecials(),
    searchParams,
  ]);
  // "Platos del día" solo existe si hay alguno publicado (si no, la URL muestra la carta).
  const showSpecials = query[SPECIALS_VIEW_PARAM] === SPECIALS_VIEW && specials.length > 0;
  const moment = showSpecials ? null : parseMoment(query[MOMENT_PARAM]);
  const sections = filterMenuByMoment(menu, moment);
  const tagline = moment ? momentTagline(content.moments?.items, moment) : null;

  return (
    <>
      <PageHeader
        eyebrow={SITE.descriptor}
        title={
          showSpecials ? "Platos del día" : moment ? `Carta · ${moment.label}` : "Nuestra carta"
        }
        // Debajo de la cinta: menos aire arriba que el resto de las páginas.
        className="pt-8 pb-6 md:pt-12 md:pb-8"
        intro={
          moment ? (
            <>
              {tagline && (
                <p className="font-serif text-2xl text-foreground italic md:text-3xl">{tagline}</p>
              )}
              <Link
                href="/carta"
                scroll={false}
                className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold tracking-wide text-olive underline decoration-olive/40 underline-offset-4 transition-colors hover:decoration-olive"
              >
                Ver carta completa
              </Link>
            </>
          ) : undefined
        }
      />

      {menu.length === 0 ? (
        <p className="container-site pb-24 text-center text-muted-foreground">
          Muy pronto vas a poder ver la carta completa.
        </p>
      ) : (
        <>
          <MomentFilter
            active={moment}
            hrefFor={(m) => cartaHref(undefined, m)}
            specials={
              specials.length > 0 ? { href: SPECIALS_HREF, active: showSpecials } : undefined
            }
            className="container-site pb-10 md:pb-14"
          />

          {/* `key`: al cambiar de momento la lista se vuelve a montar y entra con un fundido. */}
          <div
            key={showSpecials ? SPECIALS_VIEW : (moment?.param ?? "todo")}
            className="motion-safe:animate-in motion-safe:duration-500 motion-safe:ease-out motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
          >
            {showSpecials ? (
              <section
                id={SPECIALS_LIST_ID}
                aria-label="Platos del día"
                className="container-site pb-24 md:pb-32"
              >
                <SpecialsList specials={specials} />
              </section>
            ) : sections.length === 0 ? (
              <p className="container-site pb-24 text-center text-muted-foreground">
                Todavía no hay secciones cargadas para este momento.{" "}
                <Link href="/carta" scroll={false} className="font-semibold text-olive underline">
                  Ver carta completa
                </Link>
              </p>
            ) : (
              <nav aria-label="Secciones de la carta" className="container-site pb-24 md:pb-32">
                <ul className="mx-auto flex max-w-5xl flex-col gap-4 md:gap-5">
                  {sections.map((category, index) => (
                    <Reveal as="li" key={category.id} delay={staggerDelay(index)}>
                      <Link
                        href={cartaHref(category.slug, moment)}
                        className="block rounded-2xl transition-shadow duration-500 hover:shadow-[0_18px_40px_-20px_rgb(72_54_41/0.6)] focus-visible:outline-offset-4"
                      >
                        <CategoryBanner
                          // Índice en la carta COMPLETA: cada sección conserva su imagen al filtrar.
                          image={getCategoryImage(
                            category,
                            menu.findIndex((c) => c.id === category.id),
                          )}
                          title={category.name}
                          subtitle={category.description}
                          priority={index < 2}
                        />
                      </Link>
                    </Reveal>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </>
      )}
    </>
  );
}
