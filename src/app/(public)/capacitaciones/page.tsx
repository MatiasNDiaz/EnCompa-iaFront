import type { Metadata } from "next";

import { SESSION_TEAM } from "@/assets/sesion";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/public/page-header";
import { BrandIcon } from "@/components/shared/brand-icon";
import { LightboxGallery, type LightboxItem } from "@/components/shared/lightbox-gallery";
import { MediaImage } from "@/components/shared/media-image";
import { staggerDelay } from "@/config/motion";
import { getTrainings, type Training } from "@/features/trainings/queries";
import { getMediaUrl } from "@/lib/storage/media";
import { toParagraphs } from "@/lib/text";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Formación y experiencia",
  description:
    "Detrás de cada experiencia, hay conocimiento: la formación de nuestro equipo en café y coctelería.",
  alternates: { canonical: "/capacitaciones" },
};

export default async function TrainingsPage() {
  const trainings = await getTrainings();

  return (
    <>
      <PageHeader
        eyebrow="Formación y experiencia"
        title="Detrás de cada experiencia, hay conocimiento"
      />

      {trainings.length === 0 ? (
        <p className="container-site pb-24 text-center text-muted-foreground">
          Muy pronto vas a conocer la formación de nuestro equipo.
        </p>
      ) : (
        <div className="flex flex-col">
          {trainings.map((training, index) => (
            <TrainingModule key={training.id} training={training} reversed={index % 2 === 1} />
          ))}
        </div>
      )}

      <TeamGallery />
    </>
  );
}

/** Galería general del equipo (fotos reales de la sesión del 16-11): formación y cocina. */
function TeamGallery() {
  const items: LightboxItem[] = SESSION_TEAM.map(({ id, image, alt }) => ({
    id,
    type: "image",
    src: image.src,
    alt,
  }));

  return (
    <section aria-labelledby="equipo-title" className="border-t border-border py-16 md:py-24">
      <div className="container-site">
        <Reveal className="max-w-2xl">
          <p className="eyebrow text-olive">El equipo</p>
          <h2 id="equipo-title" className="mt-3 text-h2">
            Aprender juntos, todos los días
          </h2>
          <p className="mt-4 text-muted-foreground">
            Reuniones de formación, pruebas en la cocina y el trabajo de cada día: así se prepara el
            equipo de En Compañía.
          </p>
        </Reveal>
        <Reveal variant="fade" className="mt-10 pb-8 md:pb-12">
          <LightboxGallery
            label="Fotos del equipo de En Compañía"
            items={items}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            thumbClassName="aspect-square"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        </Reveal>
      </div>
    </section>
  );
}

function TrainingModule({ training, reversed }: { training: Training; reversed: boolean }) {
  const details = [
    { label: "Institución", value: training.organization },
    { label: "Instructor/a", value: training.instructor },
    { label: "Certificación", value: training.certificate_name },
  ].filter((d): d is { label: string; value: string } => Boolean(d.value));

  const photos: LightboxItem[] = training.training_images.map((image) => ({
    id: image.id,
    type: "image",
    src: getMediaUrl(image.image_path)!,
    alt: image.alt_text,
  }));
  const certificateUrl = getMediaUrl(training.certificate_image_path);

  return (
    <section
      aria-labelledby={`${training.slug}-title`}
      className="border-t border-border py-16 first:border-t-0 md:py-24"
    >
      <div className="container-site grid gap-10 md:grid-cols-12 md:gap-16">
        <Reveal
          variant={reversed ? "right" : "left"}
          className={cn("md:col-span-5", reversed && "md:order-2 md:col-start-8")}
        >
          <MediaImage
            path={training.cover_image_path}
            alt={training.title}
            placeholderLabel={training.slug === "cocteleria" ? "Coctelería" : "Café"}
            sizes="(min-width: 768px) 40vw, 100vw"
            className="aspect-[4/5] rounded-2xl"
          />
        </Reveal>

        <div
          className={cn("md:col-span-6", reversed ? "md:order-1 md:col-start-1" : "md:col-start-7")}
        >
          <Reveal>
            <BrandIcon
              name={training.slug === "cocteleria" ? "copa" : "taza"}
              className="mb-6 h-14 w-20 text-terracotta"
            />
            <h2 id={`${training.slug}-title`} className="text-h2">
              {training.title}
            </h2>
            {training.subtitle && (
              <p className="mt-4 font-serif text-xl text-olive italic">{training.subtitle}</p>
            )}
          </Reveal>

          <div className="mt-6 flex flex-col gap-4 text-muted-foreground">
            {toParagraphs(training.description).map((paragraph, i) => (
              <Reveal as="p" key={i} delay={staggerDelay(i)}>
                {paragraph}
              </Reveal>
            ))}
          </div>

          {details.length > 0 && (
            <Reveal as="dl" className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="eyebrow text-olive">{detail.label}</dt>
                  <dd className="mt-1 font-medium">{detail.value}</dd>
                </div>
              ))}
            </Reveal>
          )}

          {certificateUrl && (
            <Reveal className="mt-8">
              <p className="eyebrow mb-3 text-olive">Certificado</p>
              <LightboxGallery
                label={`Certificado de ${training.title}`}
                items={[
                  {
                    id: `${training.id}-cert`,
                    type: "image",
                    src: certificateUrl,
                    alt: `Certificado: ${training.certificate_name ?? training.title}`,
                  },
                ]}
                className="max-w-56"
                thumbClassName="aspect-[4/3] border border-border"
                sizes="14rem"
              />
            </Reveal>
          )}
        </div>
      </div>

      {photos.length > 0 && (
        <Reveal variant="fade" className="container-site mt-12">
          <LightboxGallery
            label={`Fotos del equipo: ${training.title}`}
            items={photos}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
            thumbClassName="aspect-square"
            sizes="(min-width: 768px) 25vw, 50vw"
          />
        </Reveal>
      )}
    </section>
  );
}
