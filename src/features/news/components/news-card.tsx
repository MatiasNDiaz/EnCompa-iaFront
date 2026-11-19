import { CalendarDays, Megaphone } from "lucide-react";
import Image from "next/image";
import type { ElementType } from "react";

import { toParagraphs } from "@/lib/text";
import { cn } from "@/lib/utils";

import { newsShortDate } from "../format";
import type { NewsPost } from "../types";
import { Branch } from "./branch";

type CardPost = Pick<
  NewsPost,
  | "slug"
  | "title"
  | "description"
  | "closingMessage"
  | "eventDate"
  | "publishedAt"
  | "media"
  | "cardLayout"
>;

/**
 * Una novedad, completa, en /novedades (no tiene página de detalle): foto o video (el
 * video se reproduce acá mismo), fecha, título, la descripción entera y el mensaje final.
 * Muestra solo lo que se carga en el panel, con el diseño que eligió el admin:
 * - `split` (Dividida): foto a la izquierda, texto a la derecha.
 * - `stacked` (Apilada): foto arriba, texto abajo y una rama de fondo.
 * - `curved` (Curva): foto a la izquierda con el borde derecho curvo.
 * El diseño depende del ANCHO DE LA TARJETA (container queries, desde 48rem), no de la
 * pantalla: en el celular las tres ponen la foto arriba, y la vista previa del panel la
 * muestra igual que la web. `preview`: archivos locales sin optimizar.
 */
export function NewsCard({
  post,
  priority = false,
  preview = false,
}: {
  post: CardPost;
  priority?: boolean;
  preview?: boolean;
}) {
  const layout = post.cardLayout;
  const Heading: ElementType = preview ? "p" : "h2";
  const date = newsShortDate(post);
  const paragraphs = toParagraphs(post.description);
  const isVideo = post.media.type === "video";

  const media =
    post.media.type === "video" ? (
      <video
        src={post.media.url}
        poster={post.media.posterUrl}
        controls
        playsInline
        preload="none"
        aria-label={`Video: ${post.title}`}
        className="absolute inset-0 size-full bg-espresso object-cover"
      >
        Tu navegador no puede reproducir este video.
      </video>
    ) : (
      <Image
        src={post.media.url}
        alt=""
        fill
        priority={priority}
        unoptimized={preview}
        sizes="(min-width: 1024px) 44rem, 100vw"
        className="object-cover"
      />
    );

  const text = (
    <>
      {date && (
        <p className="flex items-center gap-2.5 text-[0.95rem] text-muted-foreground @3xl:text-base">
          <CalendarDays aria-hidden strokeWidth={1.7} className="size-5 text-olive" />
          {date}
        </p>
      )}
      <Heading
        // El interlineado va DESPUÉS del tamaño: tailwind-merge descarta un leading-* que
        // queda antes de un text-* (el tamaño de Tailwind también fija el interlineado).
        className={cn(
          "font-serif text-balance text-foreground",
          layout === "stacked"
            ? "text-[1.9rem] @3xl:text-[clamp(2.25rem,4.2cqi,3.1rem)]"
            : "text-[1.9rem] @3xl:text-[clamp(2.25rem,4.6cqi,3.25rem)]",
          "leading-[1.02]",
        )}
      >
        {post.title || "Título de la novedad"}
      </Heading>
      {layout !== "stacked" && <span aria-hidden className="block h-px w-16 bg-olive @3xl:w-20" />}
      <div
        className={cn(
          "flex flex-col gap-3 text-[1rem] leading-relaxed text-muted-foreground @3xl:text-[1.05rem]",
          layout === "stacked" ? "max-w-[40rem]" : "max-w-[32rem]",
        )}
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, i) => (
            <p key={i} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="italic">La descripción aparece acá.</p>
        )}
      </div>
      {post.closingMessage && (
        <p className="mt-1 font-serif text-[1.45rem] leading-snug text-olive italic @3xl:text-[1.6rem]">
          {post.closingMessage}
        </p>
      )}
    </>
  );

  const shell =
    "relative overflow-hidden rounded-[1.75rem] border border-caramel/20 bg-card shadow-[0_24px_60px_-40px_rgb(72_54_41/0.55)]";

  const card = (() => {
    if (layout === "stacked") {
      return (
        <div data-layout="stacked" className={shell}>
          <div className="relative aspect-[16/10] overflow-hidden bg-secondary @3xl:aspect-[24/7]">
            {media}
            {!isVideo && (
              <div className="absolute top-5 left-5 flex items-center gap-3 @3xl:top-8 @3xl:left-10">
                <Badge tone="glass" />
                <span aria-hidden className="hidden h-px w-14 bg-cream/70 @md:block" />
              </div>
            )}
          </div>
          <div className="relative flex flex-col gap-2.5 px-6 pt-5 pb-7 @3xl:gap-3 @3xl:px-10 @3xl:pt-6 @3xl:pb-9">
            <Branch className="pointer-events-none absolute -right-8 -bottom-8 h-[70%] max-h-80 text-caramel/35 @3xl:right-2 @3xl:-bottom-10 @3xl:text-caramel/60" />
            <div className="relative flex flex-col gap-2.5 @3xl:gap-3">
              {isVideo && <Badge tone="solid" />}
              {text}
            </div>
          </div>
        </div>
      );
    }

    if (layout === "curved") {
      // Con video no se recorta la curva: taparía los controles del reproductor.
      return (
        <div data-layout="curved" className={cn(shell, "@3xl:grid @3xl:grid-cols-[1fr_1fr]")}>
          <div
            className={cn(
              "relative aspect-[16/10] overflow-hidden bg-secondary @3xl:aspect-auto @3xl:min-h-[19rem]",
              !isVideo &&
                "[clip-path:ellipse(135%_100%_at_50%_0%)] @3xl:[clip-path:ellipse(100%_125%_at_0%_50%)]",
            )}
          >
            {media}
          </div>
          <div className="flex flex-col justify-center gap-2.5 px-6 pt-3 pb-7 @3xl:gap-3.5 @3xl:py-9 @3xl:pr-10 @3xl:pl-8">
            <div className="mb-1 flex items-center gap-4">
              <Badge tone="solid" />
              <span aria-hidden className="h-px flex-1 bg-olive/70" />
            </div>
            {text}
          </div>
        </div>
      );
    }

    // split (Dividida)
    return (
      <div data-layout="split" className={cn(shell, "@3xl:grid @3xl:grid-cols-[1.15fr_1fr]")}>
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary @3xl:aspect-auto @3xl:min-h-[19rem] @3xl:rounded-[1.75rem]">
          {media}
          {!isVideo && (
            <div className="absolute top-5 left-5 @3xl:top-8 @3xl:left-8">
              <Badge tone="glass" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2.5 px-6 pt-5 pb-7 @3xl:gap-3.5 @3xl:px-10 @3xl:py-9">
          {isVideo && <Badge tone="solid" />}
          {text}
        </div>
      </div>
    );
  })();

  return (
    <article id={preview ? undefined : post.slug} aria-label={post.title} className="@container scroll-mt-28">
      {card}
    </article>
  );
}

/** Rótulo "Novedades" con el megáfono. `glass`: sobre la foto; `solid`: sobre el fondo. */
function Badge({ tone }: { tone: "glass" | "solid" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 self-start rounded-full px-4 py-2 text-[0.95rem] font-medium text-cream @3xl:px-5 @3xl:py-2.5 @3xl:text-base",
        tone === "glass"
          ? "border border-cream/25 bg-[color-mix(in_oklab,var(--color-olive)_70%,black)]/85 shadow-sm backdrop-blur-sm"
          : "bg-[color-mix(in_oklab,var(--color-olive)_82%,black)]",
      )}
    >
      <Megaphone aria-hidden strokeWidth={1.6} className="size-5" />
      Novedades
    </span>
  );
}
