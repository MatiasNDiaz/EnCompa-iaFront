import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { BrandIcon } from "@/components/shared/brand-icon";
import { staggerDelay } from "@/config/motion";
import type { SiteContentBlock } from "@/features/institutional/queries";
import { MOMENT_ICONS } from "@/features/menu/components/moment-filter";
import { cartaHref, momentFromTitle } from "@/features/menu/moments";

/**
 * "Un mismo lugar, diferentes momentos" (presentación del cliente): mañana, mediodía y noche.
 * Cada tarjeta es un único link a la carta filtrada por ese momento (/carta?momento=…).
 */
export function HomeMoments({ block }: { block?: SiteContentBlock }) {
  if (!block?.items?.length) return null;

  return (
    <section aria-labelledby="momentos" className="py-20 md:py-28">
      <div className="container-site">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow rule-ornament mb-4 text-olive">Durante el día</p>
          <h2 id="momentos" className="text-h2">
            {block.title}
          </h2>
          {block.content && <p className="mt-5 text-lead text-muted-foreground">{block.content}</p>}
        </Reveal>

        <ol className="mt-14 grid gap-4 md:mt-16 md:grid-cols-3 md:gap-6">
          {block.items.map((item, i) => {
            const [label, ...rest] = item.title.split("·");
            const moment = momentFromTitle(item.title, i);
            return (
              <Reveal as="li" key={item.title} delay={staggerDelay(i)} className="flex">
                <Link
                  href={cartaHref(undefined, moment)}
                  aria-label={moment ? `Ver la carta ${moment.ofLabel}` : "Ver la carta"}
                  className="group relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl border border-olive/20 bg-card p-7 transition-[border-color,box-shadow,transform] duration-500 ease-soft hover:-translate-y-1 hover:border-olive/50 hover:shadow-[0_18px_36px_-24px_rgb(83_107_80/0.8)] focus-visible:-translate-y-1 focus-visible:border-olive/50 active:translate-y-0 active:scale-[0.99] active:border-olive/60 md:p-9"
                >
                  {/* Barra oliva que crece en hover / foco */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-olive transition-transform duration-700 ease-soft group-hover:scale-x-100 group-focus-visible:scale-x-100 group-active:scale-x-100"
                  />
                  <BrandIcon
                    name={moment ? MOMENT_ICONS[moment.value] : "taza"}
                    className="h-12 w-16 text-olive"
                  />
                  <p className="eyebrow text-olive">{label.trim()}</p>
                  <h3 className="font-serif text-h3">{rest.join("·").trim() || label.trim()}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                  {/* Visible siempre (en mobile es la pista de que se puede tocar);
                      en pantallas con hover se desplaza y toma color. */}
                  <span
                    aria-hidden
                    className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold tracking-wide text-olive transition-[color,transform] duration-500 ease-soft [@media(hover:hover)]:text-muted-foreground [@media(hover:hover)]:group-hover:translate-x-1 [@media(hover:hover)]:group-hover:text-olive [@media(hover:hover)]:group-focus-visible:text-olive"
                  >
                    Ver carta
                    <ArrowRight
                      aria-hidden
                      className="size-4 transition-transform duration-500 ease-soft group-hover:translate-x-1 group-focus-visible:translate-x-1"
                    />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
