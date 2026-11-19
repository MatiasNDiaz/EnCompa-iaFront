import Image, { getImageProps } from "next/image";
import type { CSSProperties } from "react";

import { BRAND_IMAGES } from "@/assets/brand";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LinkButton } from "@/components/shared/link-button";
import { SITE } from "@/config/site";
import type { SiteContentBlock } from "@/features/institutional/queries";
import { getMediaUrl } from "@/lib/storage/media";

const isVideo = (path: string) => /\.(mp4|webm)$/i.test(path);

/** Retraso de cada elemento del texto en la entrada del hero (ver .hero-rise en globals.css). */
const delay = (ms: number) => ({ "--hero-delay": `${ms}ms` }) as CSSProperties;

/**
 * Hero: una única imagen y texto, con entrada animada al cargar (CSS puro, globals.css):
 * la foto se acomoda (escala) mientras se retira un velo espresso, y el texto sube en
 * cascada. La foto es el LCP: se pinta desde el primer cuadro (solo cambia la escala).
 * Con prefers-reduced-motion aparece todo quieto.
 * - Mobile: la foto arriba (entera, sin texto encima) y el texto debajo, sobre espresso.
 * - Desktop: composición editorial dividida (texto en columna espresso, imagen a la
 *   derecha).
 * - Foto del CMS (site_settings.hero_media_path) si existe; si no, la fachada de noche
 *   (desktop y mobile, con su tamaño cada uno vía <picture>).
 */
export function HomeHero({
  heroPath,
  content,
}: {
  heroPath: string | null;
  content?: SiteContentBlock;
}) {
  const heroUrl = getMediaUrl(heroPath);
  const claim = content?.title ?? SITE.claim;
  const descriptor = content?.subtitle ?? SITE.descriptor;

  return (
    <section
      aria-label="Bienvenida"
      className="relative isolate flex flex-col overflow-hidden bg-espresso md:grid md:min-h-[min(88svh,52rem)] md:grid-cols-12 md:items-stretch"
    >
      {/* Mobile: la foto arriba, ENTERA (la fachada con su cartel no se pisa con el texto) y el
          texto debajo, sobre el espresso. Desktop: foto en la columna derecha.
          overflow-hidden: durante la entrada la foto está ampliada y no debe salirse. */}
      <div className="relative aspect-[5/4] w-full overflow-hidden md:z-0 md:col-span-7 md:col-start-6 md:row-start-1 md:aspect-auto">
        <div className="hero-media absolute inset-0">
          <HeroMedia heroUrl={heroUrl} heroPath={heroPath} />
        </div>
        {/* Velo de entrada: se retira al cargar. */}
        <div aria-hidden className="hero-veil pointer-events-none absolute inset-0 bg-espresso" />
        {/* Desktop: fundido suave entre la columna de texto y la foto. */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-espresso to-transparent md:block"
        />
        {/* Mobile: fundido de la foto hacia el espresso del texto. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-espresso to-transparent md:hidden"
        />
      </div>

      <div className="relative w-full px-5 pt-6 pb-16 text-cream sm:px-8 md:col-span-5 md:col-start-1 md:row-start-1 md:flex md:items-center md:py-20 md:pr-6 md:pl-12 lg:pl-[max(3rem,calc((100vw-84rem)/2+3rem))]">
        <div className="max-w-xl">
          {/* Logo 2026 crema (incluye la bajada). Solo desde md: en mobile el cartel iluminado
              de la fachada ya es el logo (y el encabezado lo muestra centrado). */}
          <div className="hero-rise hidden md:block" style={delay(60)}>
            <BrandLogo
              variant="light"
              priority
              sizes="(min-width: 1024px) 18rem, (min-width: 768px) 16rem, min(72vw, 20rem)"
              className="w-[min(72vw,20rem)] md:w-64 lg:w-72"
            />
          </div>
          <p className="hero-rise eyebrow text-caramel md:mt-7" style={delay(140)}>
            {descriptor}
          </p>
          <h1
            className="hero-rise mt-4 font-serif text-display italic md:text-[clamp(2.75rem,1rem+3.4vw,4.75rem)]"
            style={delay(220)}
          >
            {claim}
          </h1>

          <div
            className="hero-rise mt-10 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row"
            style={delay(300)}
          >
            <LinkButton href="/galeria" variant="light" arrow>
              Recorré el espacio
            </LinkButton>
            <LinkButton href="/carta" variant="accent">
              Ver carta
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMedia({ heroUrl, heroPath }: { heroUrl: string | null; heroPath: string | null }) {
  if (heroUrl && heroPath && isVideo(heroPath)) {
    return (
      <video
        className="h-full w-full object-cover"
        src={heroUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
    );
  }

  if (heroUrl) {
    // Decorativa (alt vacío): el texto del hero transmite el contenido.
    return (
      <Image
        src={heroUrl}
        alt=""
        fill
        sizes="(min-width: 768px) 58vw, 100vw"
        priority
        className="object-cover"
      />
    );
  }

  // Calidad 60: es fondo bajo overlay oscuro; la diferencia no se percibe y pesa menos (LCP).
  const common = { alt: "", priority: true, quality: 60 as const, fill: true };
  // Desktop y mobile: la fachada iluminada de noche (a pedido del cliente, aunque el letrero
  // diga "Vermú"). Si se carga una foto desde site_settings.hero_media_path, se reemplaza sola.
  const desktop = getImageProps({ ...common, src: BRAND_IMAGES.fachadaNoche, sizes: "58vw" }).props;
  const mobile = getImageProps({ ...common, src: BRAND_IMAGES.fachadaNoche, sizes: "100vw" }).props;

  return (
    <>
      <picture>
        <source media="(min-width: 768px)" srcSet={desktop.srcSet} sizes={desktop.sizes} />
        {/* <img> dentro de <picture> es el patrón oficial de art direction (getImageProps). */}
        <img
          {...mobile}
          // Es el LCP: se pide antes que scripts y logos (getImageProps no lo agrega en <picture>).
          fetchPriority="high"
          loading="eager"
          alt=""
          className="h-full w-full object-cover object-center"
          // Se conserva el estilo de `fill` (position absolute): si no, la proporción de la
          // imagen define el alto de la sección.
          style={{
            ...mobile.style,
            backgroundImage: `url(${BRAND_IMAGES.fachadaNoche.blurDataURL})`,
            backgroundSize: "cover",
          }}
        />
      </picture>
    </>
  );
}
