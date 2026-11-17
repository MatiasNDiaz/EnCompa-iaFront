import { BRAND_IMAGES } from "@/assets/brand";
import { Reveal } from "@/components/motion/reveal";
import { LinkButton, TextLink } from "@/components/shared/link-button";
import { MediaImage } from "@/components/shared/media-image";
import type { TourArea } from "@/features/tour/queries";

/**
 * "El espacio": si hay fotos reales del recorrido, muestra hasta 3 (una por ambiente).
 * Si no, una imagen panorámica del manual rotulada como ilustrativa.
 */
export function HomeSpace({ tour }: { tour: TourArea[] }) {
  const highlights = tour
    .flatMap((area) => area.images.slice(0, 1).map((image) => ({ area, image })))
    .slice(0, 3);

  return (
    <section aria-labelledby="el-espacio" className="py-20 md:py-32">
      <div className="container-site grid gap-10 md:grid-cols-12 md:items-end">
        <Reveal className="md:col-span-5">
          <p className="eyebrow mb-4 text-olive">El espacio</p>
          <h2 id="el-espacio" className="text-h2">
            Entrá. Recorré. Descubrí.
          </h2>
        </Reveal>
        <Reveal
          delay={120}
          className="flex flex-wrap items-center gap-6 md:col-span-6 md:col-start-7 md:justify-end"
        >
          <LinkButton href="/recorrido" variant="outline" arrow>
            Recorré el espacio
          </LinkButton>
          <TextLink href="/galeria">Ver galería</TextLink>
        </Reveal>
      </div>

      <div className="container-site mt-12">
        {highlights.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map(({ area, image }, index) => (
              <Reveal key={image.id} delay={index * 90}>
                <MediaImage
                  path={image.image_path}
                  alt={image.title}
                  placeholderLabel={area.title}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="aspect-[4/5] rounded-2xl"
                />
                <p className="mt-3 text-sm text-muted-foreground">{area.title}</p>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal variant="clip">
            <MediaImage
              fallback={BRAND_IMAGES.interiorSalon}
              alt="Salón con mesas de madera y sillones"
              placeholderLabel="El espacio"
              sizes="(min-width: 1344px) 1248px, 100vw"
              className="aspect-[4/5] rounded-2xl sm:aspect-[16/9] md:aspect-[21/9]"
              imageClassName="object-[50%_60%]"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
