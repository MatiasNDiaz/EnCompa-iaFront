import type { StaticImageData } from "next/image";

import { SESSION_PHOTOS } from "@/assets/sesion";
import { Reveal } from "@/components/motion/reveal";
import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";
import { TextLink } from "@/components/shared/link-button";
import { MENU_CATEGORY_IMAGES } from "@/assets/menu";
import { MediaImage } from "@/components/shared/media-image";
import { SectionHeading } from "@/components/shared/section-heading";
import { SITE } from "@/config/site";
import type { SiteContentMap, SiteContentBlock } from "@/features/institutional/queries";
import { cn } from "@/lib/utils";

const OFFERS: {
  key: "offer_coffee" | "offer_tapas" | "offer_cocktails";
  icon: BrandIconName;
  anchor: string;
}[] = [
  { key: "offer_coffee", icon: "taza", anchor: "cafeteria" },
  { key: "offer_tapas", icon: "plato", anchor: "tapeo-y-para-compartir" },
  { key: "offer_cocktails", icon: "copa", anchor: "cocteleria" },
];

/** Fotos reales del local por bloque (sin rótulo). El resto usa la foto de banco de la carta. */
const REAL_PHOTOS: Partial<Record<(typeof OFFERS)[number]["key"], StaticImageData>> = {
  offer_coffee: SESSION_PHOTOS.cafeCappuccinoCroissants,
};

/** "Nuestra propuesta": Café / Tapeo / Cocktails, alternando imagen y texto. */
export function HomeOffer({ content }: { content: SiteContentMap }) {
  const blocks = OFFERS.map((offer) => ({ ...offer, block: content[offer.key] })).filter(
    (o): o is typeof o & { block: SiteContentBlock } => Boolean(o.block),
  );
  if (blocks.length === 0) return null;

  return (
    <section
      aria-labelledby="propuesta"
      className="bg-[color-mix(in_oklab,var(--color-olive)_9%,var(--color-cream))] py-20 md:py-32"
    >
      <div className="container-site">
        <SectionHeading
          eyebrow="Nuestra propuesta"
          title={<span id="propuesta">{SITE.descriptor}</span>}
          align="center"
        />

        <div className="mt-16 flex flex-col gap-20 md:mt-24 md:gap-28">
          {blocks.map(({ key, icon, anchor, block }, index) => {
            const reversed = index % 2 === 1;
            return (
              <article key={key} className="grid items-center gap-8 md:grid-cols-12 md:gap-16">
                <Reveal
                  variant={reversed ? "right" : "left"}
                  className={cn("md:col-span-7", reversed && "md:order-2 md:col-start-6")}
                >
                  <MediaImage
                    path={block.image_path}
                    fallback={REAL_PHOTOS[key] ?? MENU_CATEGORY_IMAGES[anchor]}
                    fallbackIsIllustrative={!REAL_PHOTOS[key]}
                    alt={block.title ?? ""}
                    placeholderLabel={block.title ?? "Propuesta"}
                    sizes="(min-width: 768px) 55vw, 100vw"
                    className="group aspect-[4/3] rounded-2xl"
                    imageClassName="transition-transform duration-700 ease-soft group-hover:scale-[1.03]"
                  />
                </Reveal>

                <Reveal
                  variant={reversed ? "left" : "right"}
                  delay={120}
                  className={cn(
                    "md:col-span-4",
                    reversed ? "md:order-1 md:col-start-1" : "md:col-start-9",
                  )}
                >
                  <BrandIcon name={icon} className="mb-6 h-14 w-20 text-terracotta" />
                  <h3 className="text-h2">{block.title}</h3>
                  {block.subtitle && (
                    <p className="mt-3 font-serif text-xl text-olive italic">{block.subtitle}</p>
                  )}
                  {block.content && <p className="mt-5 text-muted-foreground">{block.content}</p>}
                  <TextLink href={`/carta/${anchor}`} className="mt-7">
                    Ver en la carta
                  </TextLink>
                </Reveal>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
