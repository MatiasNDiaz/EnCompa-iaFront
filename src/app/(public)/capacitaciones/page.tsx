import type { Metadata } from "next";

import { FORMATION_PHOTOS, type SessionPhoto } from "@/assets/sesion";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/public/page-header";
import { BrandIcon } from "@/components/shared/brand-icon";
import { LightboxGallery, type LightboxItem } from "@/components/shared/lightbox-gallery";
import { MediaImage } from "@/components/shared/media-image";
import { staggerDelay } from "@/config/motion";
import { SITE } from "@/config/site";
import { getSiteContent, type SiteContentMap } from "@/features/institutional/queries";
import { getTrainings, type Training } from "@/features/trainings/queries";
import { getMediaUrl } from "@/lib/storage/media";
import { toParagraphs } from "@/lib/text";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Formación y experiencia",
  description:
    "Detrás de cada experiencia, hay conocimiento: la formación de nuestro equipo en café y coctelería, y las personas detrás de cada encuentro.",
  alternates: { canonical: "/capacitaciones" },
};

/**
 * Formación y equipo en una sola página: bloques de foto + texto que alternan de lado
 * (frase, foto del equipo, frase, foto…) y, en el medio, una foto grande de todo el
 * equipo. Sin grillas de fotos.
 * Los textos son OFICIALES del cliente (nada inventado): la intro sale de "Nuestra
 * esencia", las capacitaciones de `trainings` y los demás bloques de "Nuestros valores"
 * (site_content, editables desde la base). Si faltan, se usan los mismos textos oficiales.
 */
const VALUES = {
  conocimiento: {
    value: "CONOCIMIENTO Y FORMACIÓN",
    fallback: "Aprender, perfeccionar técnicas y crecer para ofrecer siempre lo mejor.",
  },
  detalle: {
    value: "EXCELENCIA EN CADA DETALLE",
    fallback:
      "Cuidamos la preparación, la presentación y el servicio, porque todo forma parte de la experiencia.",
  },
  hospitalidad: {
    value: "HOSPITALIDAD",
    fallback:
      "Recibir bien, atender con calidez y hacer que cada persona se sienta cómoda y bienvenida.",
  },
  identidad: {
    value: "CREATIVIDAD E IDENTIDAD",
    fallback:
      "Una propuesta que combina sabores, técnicas y tradiciones para ofrecer algo propio y diferente.",
  },
} as const;

type ValueKey = keyof typeof VALUES;

const INTRO_FALLBACK =
  "Invertimos especialmente en la formación y capacitación de nuestro equipo. Creemos que el conocimiento se refleja en el resultado y que las personas son una parte esencial de la experiencia. Queremos que cada integrante conozca su oficio, perfeccione sus técnicas y pueda brindar una atención cálida, profesional y cercana.";

/** "CONOCIMIENTO Y FORMACIÓN" → "Conocimiento y formación". */
const sentenceCase = (text: string) =>
  text.charAt(0).toLocaleUpperCase("es") + text.slice(1).toLocaleLowerCase("es");

/** El párrafo de "Nuestra esencia" sobre el equipo, sin el "Por eso," que lo une al anterior. */
function introFrom(content: SiteContentMap) {
  const paragraph = toParagraphs(content.essence?.content).find((p) => p.includes("equipo"));
  if (!paragraph) return INTRO_FALLBACK;
  const text = paragraph.replace(/^Por eso,\s*/i, "");
  return text.charAt(0).toLocaleUpperCase("es") + text.slice(1);
}

function valueFrom(content: SiteContentMap, key: ValueKey) {
  const { value, fallback } = VALUES[key];
  const item = content.values?.items?.find((i) => i.title.toLocaleUpperCase("es") === value);
  return { title: sentenceCase(value), text: item?.description ?? fallback };
}

export default async function TrainingsPage() {
  const [content, trainings] = await Promise.all([getSiteContent(), getTrainings()]);
  const value = (key: ValueKey, reversed: boolean) => (
    <ValueBlock {...valueFrom(content, key)} photo={FORMATION_PHOTOS[key]} reversed={reversed} />
  );
  const [first, second, ...others] = trainings;

  return (
    <>
      <PageHeader
        eyebrow="Formación y experiencia"
        title="Detrás de cada experiencia, hay conocimiento"
        intro={<p>{introFrom(content)}</p>}
      />

      <div className="pb-24 md:pb-32">
        {/* Las fotos alternan de lado en toda la página: izquierda, derecha, izquierda… */}
        {value("conocimiento", false)}
        {first && <TrainingModule training={first} reversed />}

        <TeamPhoto />

        {second && <TrainingModule training={second} reversed={false} />}
        {others.map((training, i) => (
          <TrainingModule key={training.id} training={training} reversed={i % 2 === 0} />
        ))}
        {value("detalle", true)}
        {value("hospitalidad", false)}
        {value("identidad", true)}
      </div>
    </>
  );
}

/** Todo el equipo, en grande, en el medio de la página. */
function TeamPhoto() {
  return (
    <section aria-label="Nuestro equipo" className="py-12 md:py-20">
      <Reveal variant="scale" className="container-site">
        <figure>
          <MediaImage
            fallback={FORMATION_PHOTOS.completo.image}
            alt={FORMATION_PHOTOS.completo.alt}
            placeholderLabel="Nuestro equipo"
            sizes="(min-width: 1344px) 1248px, 100vw"
            className="aspect-[4/3] rounded-2xl md:aspect-[2000/1455]"
          />
          <figcaption className="mt-8 text-center">
            <span className="eyebrow block text-olive">Nuestro equipo</span>
            <span className="mt-3 block font-serif text-h2 text-olive italic">{SITE.claim}</span>
          </figcaption>
        </figure>
      </Reveal>
    </section>
  );
}

/** Un valor de la marca: foto del equipo y texto, en dos columnas (`reversed`: foto a la derecha). */
function ValueBlock({
  title,
  text,
  photo,
  reversed,
}: {
  title: string;
  text: string;
  photo: SessionPhoto;
  reversed: boolean;
}) {
  return (
    <section aria-label={title} className="py-12 md:py-20">
      <div className="container-site grid items-center gap-8 md:grid-cols-12 md:gap-16">
        <Reveal
          variant={reversed ? "right" : "left"}
          className={cn("md:col-span-7", reversed && "md:order-2 md:col-start-6")}
        >
          <MediaImage
            fallback={photo.image}
            alt={photo.alt}
            placeholderLabel={title}
            sizes="(min-width: 768px) 55vw, 100vw"
            className="aspect-[3/2] rounded-2xl"
          />
        </Reveal>
        <Reveal
          delay={100}
          className={cn("md:col-span-4", reversed ? "md:order-1 md:col-start-1" : "md:col-start-9")}
        >
          <p className="eyebrow mb-4 text-olive">Nuestros valores</p>
          <h2 className="text-h2">{title}</h2>
          <p className="mt-5 text-lead text-muted-foreground">{text}</p>
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
  // Portada del CMS si existe; si no, una foto real del equipo (no una textura vacía).
  const cover =
    training.slug === "cocteleria" ? FORMATION_PHOTOS.cocteleria : FORMATION_PHOTOS.cafe;

  return (
    <section aria-labelledby={`${training.slug}-title`} className="py-12 md:py-20">
      <div className="container-site grid items-center gap-10 md:grid-cols-12 md:gap-16">
        <Reveal
          variant={reversed ? "right" : "left"}
          className={cn("md:col-span-5", reversed && "md:order-2 md:col-start-8")}
        >
          <MediaImage
            path={training.cover_image_path}
            fallback={cover.image}
            alt={training.cover_image_path ? training.title : cover.alt}
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
