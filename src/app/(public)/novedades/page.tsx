import { Newspaper } from "lucide-react";
import type { Metadata } from "next";

import { Reveal } from "@/components/motion/reveal";
import { PageHeader } from "@/components/public/page-header";
import { LinkButton } from "@/components/shared/link-button";
import { staggerDelay } from "@/config/motion";
import { SITE } from "@/config/site";
import { NewsCard } from "@/features/news/components/news-card";
import { getPublishedNews } from "@/features/news/queries";

export const metadata: Metadata = {
  title: "Novedades",
  description: `Eventos, promociones y propuestas especiales de ${SITE.name}, en ${SITE.locality}.`,
  alternates: { canonical: "/novedades" },
};

/** Lista de novedades publicadas, de la más reciente a la más vieja. */
export default async function NewsPage() {
  const news = await getPublishedNews();

  return (
    <>
      <PageHeader
        eyebrow="Novedades"
        title="Lo que pasa en En Compañía"
        intro="Eventos, promociones y propuestas especiales."
      />

      <div className="container-site pb-24 md:pb-32">
        {news.length > 0 ? (
          // Una por fila: cada tarjeta usa su propio diseño (elegido en el panel).
          <ul className="mx-auto flex max-w-6xl flex-col gap-8 md:gap-12">
            {news.map((post, i) => (
              <Reveal as="li" key={post.id} delay={staggerDelay(i)}>
                <NewsCard post={post} priority={i < 2} />
              </Reveal>
            ))}
          </ul>
        ) : (
          <Reveal className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-dashed border-caramel/40 bg-card px-8 py-14 text-center">
            <Newspaper aria-hidden className="size-9 text-olive" strokeWidth={1.4} />
            <p className="font-serif text-h3">Todavía no hay novedades</p>
            <p className="text-muted-foreground">
              Muy pronto vas a encontrar acá nuestros eventos y propuestas especiales.
            </p>
            <LinkButton href="/carta" variant="accent" className="mt-2">
              Ver la carta
            </LinkButton>
          </Reveal>
        )}
      </div>
    </>
  );
}
