import Image from "next/image";
import type { ElementType } from "react";

import { toParagraphs } from "@/lib/text";
import { cn } from "@/lib/utils";

import { newsDateLabel } from "../format";
import type { NewsPost } from "../types";

type ArticlePost = Pick<
  NewsPost,
  "title" | "description" | "closingMessage" | "eventDate" | "publishedAt" | "media"
>;

/**
 * Detalle de una novedad, con estilo editorial: imagen o video grande, fecha, título,
 * la descripción en párrafos y el mensaje final destacado al cierre.
 * La usa /novedades/[slug] y la vista previa del panel (`preview`: archivos locales
 * sin optimizar, título como h3 y medidas para el panel lateral).
 */
export function NewsArticle({ post, preview = false }: { post: ArticlePost; preview?: boolean }) {
  const Heading: ElementType = preview ? "h3" : "h1";
  const date = newsDateLabel(post);
  const paragraphs = toParagraphs(post.description);

  return (
    <article className={cn("flex flex-col", preview ? "gap-6" : "gap-10 md:gap-14")}>
      <header className={cn("mx-auto w-full text-center", preview ? "" : "max-w-3xl")}>
        <p className="eyebrow rule-ornament mb-4 text-olive">
          {post.eventDate ? "Evento" : "Novedad"}
          {date && <> · {date}</>}
        </p>
        <Heading
          className={cn(
            "font-serif leading-[1.05] text-balance",
            preview ? "text-[2.1rem]" : "text-display",
          )}
        >
          {post.title || "Título de la novedad"}
        </Heading>
      </header>

      <div className={cn("mx-auto w-full", preview ? "" : "max-w-5xl")}>
        {post.media.type === "video" ? (
          <video
            src={post.media.url}
            poster={post.media.posterUrl}
            controls
            playsInline
            preload="none"
            className="aspect-video w-full rounded-3xl bg-espresso object-cover"
          >
            Tu navegador no puede reproducir este video.
          </video>
        ) : (
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-secondary md:aspect-16/9">
            <Image
              src={post.media.url}
              alt=""
              fill
              priority={!preview}
              unoptimized={preview}
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-cover"
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-5 text-lead",
          preview ? "" : "max-w-2xl",
        )}
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((paragraph, i) => (
            <p key={i} className={cn("whitespace-pre-line", i > 0 && "text-muted-foreground")}>
              {paragraph}
            </p>
          ))
        ) : (
          <p className="text-muted-foreground italic">La descripción aparece acá.</p>
        )}
      </div>

      {post.closingMessage && (
        <figure className={cn("mx-auto w-full text-center", preview ? "" : "max-w-3xl")}>
          <span aria-hidden className="mx-auto mb-6 block h-px w-16 bg-caramel" />
          <p
            className={cn(
              "font-serif text-olive italic text-balance",
              preview ? "text-[1.9rem] leading-tight" : "text-h2",
            )}
          >
            {post.closingMessage}
          </p>
        </figure>
      )}
    </article>
  );
}
