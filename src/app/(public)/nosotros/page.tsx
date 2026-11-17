import type { Metadata } from "next";

import { BRAND_IMAGES } from "@/assets/brand";
import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/public/page-header";
import { BrandLogo } from "@/components/shared/brand-logo";
import { MediaImage } from "@/components/shared/media-image";
import { staggerDelay } from "@/config/motion";
import { getSiteContent, type SiteContentBlock } from "@/features/institutional/queries";
import { toParagraphs } from "@/lib/text";

export const metadata: Metadata = {
  title: "Nuestra historia",
  description:
    "Una familia que llegó desde Suiza y encontró en La Cumbre un lugar para echar raíces.",
  alternates: { canonical: "/nosotros" },
};

export default async function AboutPage() {
  const content = await getSiteContent();
  const { history, essence, mission, vision, values, differentiation, name_meaning, experience } =
    content;

  return (
    <>
      <PageHeader eyebrow="Nuestra historia" title={history?.title ?? "Nuestra historia"} />

      {history && <EditorialText block={history} imageFallback />}

      {name_meaning && <ItemsTrio block={name_meaning} eyebrow="Nuestra identidad" />}

      {essence && (
        <section aria-labelledby="esencia" className="bg-secondary/60 py-20 md:py-28">
          <div className="container-site grid gap-10 md:grid-cols-12">
            <Reveal className="md:col-span-4">
              <p className="eyebrow mb-4 text-olive">Nuestra esencia</p>
              <h2 id="esencia" className="text-h2">
                {essence.title}
              </h2>
            </Reveal>
            <div className="flex flex-col gap-5 text-lead text-muted-foreground md:col-span-7 md:col-start-6">
              {toParagraphs(essence.content).map((paragraph, i) => (
                <Reveal as="p" key={i} delay={staggerDelay(i)}>
                  {paragraph}
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {(mission || vision) && (
        <section aria-label="Misión y visión" className="py-20 md:py-28">
          <div className="container-site grid gap-12 md:grid-cols-2 md:gap-20">
            {[mission, vision].filter(Boolean).map((block, i) => (
              <Reveal
                key={block!.section}
                delay={i * 120}
                className="border-t-2 border-olive/40 pt-8"
              >
                <h2 className="text-h3 text-olive">{block!.title}</h2>
                <p className="mt-5 font-serif text-[1.5rem] leading-snug md:text-[1.75rem]">
                  {block!.content}
                </p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {values?.items && values.items.length > 0 && (
        <section aria-labelledby="valores" className="bg-olive py-20 text-cream md:py-28">
          <div className="container-site">
            <Reveal className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
              <h2 id="valores" className="text-h2">
                {values.title}
              </h2>
              <BrandLogo variant="seal" decorative className="w-28 opacity-80 md:w-36" />
            </Reveal>
            <ol className="mt-12 grid gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {values.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={staggerDelay(i)}
                  className="border-t border-cream/30 pt-6"
                >
                  <p className="font-serif text-lg text-cream tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 font-sans text-sm font-semibold tracking-[0.14em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-cream">{item.description}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {experience && <ItemsTrio block={experience} eyebrow="Cómo atendemos" />}

      {differentiation && <EditorialText block={differentiation} />}
    </>
  );
}

/** Bloque de 3 ítems numerados (identidad del nombre, experiencia del cliente). */
function ItemsTrio({ block, eyebrow }: { block: SiteContentBlock; eyebrow: string }) {
  if (!block.items?.length) return null;
  return (
    <section aria-label={block.title ?? eyebrow} className="py-16 md:py-24">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow rule-ornament mb-4 text-olive">{eyebrow}</p>
          <h2 className="text-h2">{block.title}</h2>
          {block.content && <p className="mt-5 text-lead text-muted-foreground">{block.content}</p>}
        </Reveal>
        <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {block.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.title}
              delay={staggerDelay(i)}
              className="rounded-2xl bg-[color-mix(in_oklab,var(--color-olive)_9%,var(--color-cream))] p-7 md:p-8"
            >
              <p className="font-serif text-2xl text-olive tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-3 font-serif text-h3">{item.title}</h3>
              <p className="mt-3 text-muted-foreground">{item.description}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Texto editorial largo + cita destacada (+ imagen de identidad opcional). */
function EditorialText({
  block,
  imageFallback = false,
}: {
  block: SiteContentBlock;
  imageFallback?: boolean;
}) {
  const paragraphs = toParagraphs(block.content);
  const isHistory = block.section === "history";

  return (
    <section aria-label={block.title ?? undefined} className="py-16 md:py-24">
      <div className="container-site">
        {!isHistory && block.title && (
          <Reveal className="mx-auto mb-10 max-w-3xl">
            <h2 className="text-h2">{block.title}</h2>
          </Reveal>
        )}

        <div className="mx-auto flex max-w-3xl flex-col gap-6 text-lead">
          {paragraphs.map((paragraph, i) => (
            <Reveal
              as="p"
              key={i}
              delay={staggerDelay(i)}
              className={i === 0 ? "text-foreground" : "text-muted-foreground"}
            >
              {paragraph}
            </Reveal>
          ))}
        </div>

        {block.quote && (
          <Reveal as="figure" className="mx-auto mt-14 max-w-4xl text-center md:mt-20">
            <blockquote className="font-serif text-h2 text-olive italic">
              «{block.quote}»
            </blockquote>
          </Reveal>
        )}

        {(imageFallback || block.image_path) && (
          <Reveal variant="scale" className="mt-14 md:mt-20">
            <MediaImage
              path={block.image_path}
              fallback={imageFallback ? BRAND_IMAGES.mockupPapeleria : undefined}
              alt="Papelería y delantal con la identidad de En Compañía"
              placeholderLabel={block.title ?? "Nuestra historia"}
              sizes="(min-width: 1344px) 1248px, 100vw"
              className="aspect-[4/3] rounded-2xl sm:aspect-[1580/672]"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
