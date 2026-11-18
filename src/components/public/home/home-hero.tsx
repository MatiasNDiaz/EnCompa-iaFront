import Image, { getImageProps } from "next/image";

import { BRAND_IMAGES } from "@/assets/brand";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LinkButton } from "@/components/shared/link-button";
import { SITE } from "@/config/site";
import type { SiteContentBlock } from "@/features/institutional/queries";
import { getMediaUrl } from "@/lib/storage/media";

const isVideo = (path: string) => /\.(mp4|webm)$/i.test(path);

/**
 * Hero: una única imagen estática y texto. Es el LCP: no se anima.
 * - Mobile: imagen a sangre completa con texto superpuesto (overlay de contraste).
 * - Desktop: composición editorial dividida (texto en columna espresso, imagen a la
 *   derecha), para que el letrero de la fachada no compita con el titular.
 * - Foto del CMS (site_settings.hero_media_path) si existe; si no, fotos del local del
 *   manual de marca, vía <picture> (no se descargan ambas).
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
      className="relative isolate flex min-h-[86svh] items-end overflow-hidden bg-espresso md:grid md:min-h-[min(88svh,52rem)] md:grid-cols-12 md:items-stretch"
    >
      <div className="absolute inset-0 -z-20 md:relative md:z-0 md:col-span-7 md:col-start-6 md:row-start-1">
        <HeroMedia heroUrl={heroUrl} heroPath={heroPath} />
        {/* Desktop: fundido suave entre la columna de texto y la foto. */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-espresso to-transparent md:block"
        />
      </div>

      {/* Mobile: overlay para contraste del texto sobre la foto (≥ 4,5:1). */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(72_54_41/0.2)_0%,rgb(72_54_41/0.35)_40%,rgb(48_36_27/0.88)_100%)] md:hidden"
      />

      <div className="relative w-full px-5 pt-24 pb-16 text-cream sm:px-8 md:col-span-5 md:col-start-1 md:row-start-1 md:flex md:items-center md:py-20 md:pr-6 md:pl-12 lg:pl-[max(3rem,calc((100vw-84rem)/2+3rem))]">
        <div className="max-w-xl">
          {/* Logo 2026 crema (incluye la bajada "Café · Tapeo · Cocktails"). */}
          <BrandLogo
            variant="light"
            priority
            sizes="(min-width: 1024px) 18rem, (min-width: 768px) 16rem, min(72vw, 20rem)"
            className="w-[min(72vw,20rem)] md:w-64 lg:w-72"
          />
          <p className="eyebrow mt-7 text-caramel">{descriptor}</p>
          <h1 className="mt-4 font-serif text-display italic md:text-[clamp(2.75rem,1rem+3.4vw,4.75rem)]">
            {claim}
          </h1>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <LinkButton href="/recorrido" variant="light" arrow>
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
  const desktop = getImageProps({ ...common, src: BRAND_IMAGES.fachadaNoche, sizes: "58vw" }).props;
  const mobile = getImageProps({
    ...common,
    src: BRAND_IMAGES.interiorSalon,
    sizes: "100vw",
  }).props;

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
          style={{
            backgroundImage: `url(${BRAND_IMAGES.interiorSalon.blurDataURL})`,
            backgroundSize: "cover",
          }}
        />
      </picture>
    </>
  );
}
