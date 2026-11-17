import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/public/page-header";
import { LightboxGallery } from "@/components/shared/lightbox-gallery";
import { PhotoPlaceholder } from "@/components/shared/photo-placeholder";
import { BRAND_IMAGES } from "@/assets/brand";
import { LOCAL_RENDERS, RENDER_CAPTION } from "@/assets/local";
import type { LightboxItem } from "@/components/shared/lightbox-gallery";
import { getTour, type TourAreaKey } from "@/features/tour/queries";
import { getMediaUrl } from "@/lib/storage/media";

/**
 * Imágenes por defecto mientras el admin no cargue las del recorrido (las del CMS tienen
 * prioridad): fotos reales del manual de marca + renders del proyecto, SIEMPRE rotulados
 * (CLAUDE.md §8.4). "Los detalles" todavía no tiene imagen.
 */
const DEFAULT_PHOTOS: Partial<Record<TourAreaKey, LightboxItem[]>> = {
  salon: [
    {
      id: "default-salon",
      type: "image",
      src: BRAND_IMAGES.interiorSalon.src,
      alt: "Salón con mesas de madera y sillones",
    },
    {
      id: "render-salon",
      type: "image",
      src: LOCAL_RENDERS.renderSalon.src,
      alt: "Render del salón: paredes verdes, vigas de madera y cuadros de paisajes",
      caption: RENDER_CAPTION,
    },
  ],
  barra: [
    {
      id: "render-barra",
      type: "image",
      src: LOCAL_RENDERS.renderBarra.src,
      alt: "Render de la barra con botellero iluminado",
      caption: RENDER_CAPTION,
    },
    {
      id: "render-salon-barra",
      type: "image",
      src: BRAND_IMAGES.renderSalonBarra.src,
      alt: "Render del salón y la barra",
      caption: RENDER_CAPTION,
    },
  ],
  rincones: [
    {
      id: "default-rincones",
      type: "image",
      src: BRAND_IMAGES.interiorSillon.src,
      alt: "Sillón capitoné en verde oliva",
    },
  ],
};

export const metadata: Metadata = {
  title: "Recorré el espacio",
  description:
    "Conocé En Compañía antes de visitarnos: el salón, la barra, nuestros rincones y los detalles.",
  alternates: { canonical: "/recorrido" },
};

export default async function TourPage() {
  const areas = await getTour();

  return (
    <>
      <PageHeader
        eyebrow="El espacio"
        title="Recorré el espacio"
        intro="Entrá. Recorré. Descubrí."
      />

      <div className="container-site flex flex-col gap-20 pb-24 md:gap-28 md:pb-32">
        {areas.map((area) => (
          <section
            key={area.key}
            id={area.key}
            aria-labelledby={`${area.key}-title`}
            className="scroll-mt-28"
          >
            <Reveal className="mb-8 flex flex-col gap-2 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
              <h2 id={`${area.key}-title`} className="text-h2">
                {area.title}
              </h2>
              <p className="text-muted-foreground">{area.description}</p>
            </Reveal>

            {area.images.length > 0 || DEFAULT_PHOTOS[area.key] ? (
              <Reveal variant="fade">
                <LightboxGallery
                  label={`Fotos de ${area.title}`}
                  items={
                    area.images.length > 0
                      ? area.images.map((image) => ({
                          id: image.id,
                          type: "image" as const,
                          src: getMediaUrl(image.image_path)!,
                          alt: image.title,
                          caption: image.description,
                        }))
                      : DEFAULT_PHOTOS[area.key]!
                  }
                  className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 [&>li:first-child]:col-span-2 md:[&>li:first-child]:row-span-2 [&>li:first-child>button]:aspect-[16/10] md:[&>li:first-child>button]:aspect-auto md:[&>li:first-child>button]:h-full"
                  thumbClassName="aspect-[4/5]"
                  sizes="(min-width: 768px) 33vw, 50vw"
                />
              </Reveal>
            ) : (
              <Reveal variant="fade">
                <PhotoPlaceholder
                  label={area.title}
                  className="aspect-[16/10] rounded-2xl md:aspect-[21/9]"
                />
              </Reveal>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
