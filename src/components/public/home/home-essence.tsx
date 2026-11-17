import { LOCAL_PHOTOS } from "@/assets/local";
import { Reveal } from "@/components/motion/reveal";
import { TextLink } from "@/components/shared/link-button";
import { MediaImage } from "@/components/shared/media-image";
import type { SiteContentMap } from "@/features/institutional/queries";
import { toParagraphs } from "@/lib/text";

/** Bienvenida oficial + "Nuestra esencia" en composición editorial asimétrica. */
export function HomeEssence({ content }: { content: SiteContentMap }) {
  const welcome = content.home_hero?.content;
  const essence = content.essence;
  const [firstParagraph] = toParagraphs(essence?.content);

  return (
    <section className="py-20 md:py-32">
      {welcome && (
        <Reveal className="container-site">
          <div className="rule-ornament mb-8" aria-hidden>
            <span className="size-1.5 rotate-45 bg-current" />
          </div>
          <p className="mx-auto max-w-3xl text-center font-serif text-h3 leading-snug md:text-[2.25rem] md:leading-[1.3]">
            {welcome}
          </p>
        </Reveal>
      )}

      {essence && (
        <div className="container-site isolate mt-20 grid items-center gap-10 md:mt-32 md:grid-cols-12 md:gap-16">
          {/* Composición editorial con fotos reales de platos de la casa. */}
          <div className="relative pr-10 pb-12 md:col-span-5 md:pr-14 md:pb-16">
            <Reveal variant="clip">
              <MediaImage
                path={essence.image_path}
                fallback={LOCAL_PHOTOS.platoHuevosBenedictinos}
                alt="Huevos benedictinos sobre pan tostado, con flores y brotes"
                placeholderLabel="Nuestra esencia"
                sizes="(min-width: 768px) 34vw, 85vw"
                className="aspect-[4/5] rounded-2xl"
              />
            </Reveal>
            <Reveal
              variant="up"
              delay={350}
              className="absolute right-0 bottom-0 w-[46%] rounded-2xl border-[6px] border-background shadow-[0_24px_48px_-24px_rgb(72_54_41/0.55)]"
            >
              <MediaImage
                fallback={LOCAL_PHOTOS.platoAvocadoToast}
                alt="Avocado toast con huevo pochado"
                placeholderLabel="Nuestra esencia"
                sizes="(min-width: 768px) 16vw, 40vw"
                className="aspect-square rounded-xl"
              />
            </Reveal>
            <span
              aria-hidden
              className="absolute top-6 -left-3 -z-10 h-2/3 w-1/2 rounded-2xl bg-[color-mix(in_oklab,var(--color-olive)_14%,var(--color-cream))] md:-left-6"
            />
          </div>

          <Reveal variant="right" delay={120} className="md:col-span-6 md:col-start-7">
            <p className="eyebrow mb-4 text-olive">Nuestra esencia</p>
            <h2 className="text-h2">{essence.title}</h2>
            {firstParagraph && (
              <p className="mt-6 text-lead text-muted-foreground">{firstParagraph}</p>
            )}
            <TextLink href="/nosotros" className="mt-8">
              Conocé nuestra historia
            </TextLink>
          </Reveal>
        </div>
      )}
    </section>
  );
}
