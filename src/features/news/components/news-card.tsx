import { CalendarDays, Megaphone, MoveRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { newsExcerpt, newsShortDate } from "../format";
import type { NewsPost } from "../types";

type CardPost = Pick<
  NewsPost,
  "slug" | "title" | "description" | "eventDate" | "publishedAt" | "media" | "cardLayout"
>;

/**
 * Tarjeta de una novedad en /novedades, con el diseño que eligió el admin:
 * - `split` (Dividida): foto a la izquierda, texto a la derecha.
 * - `stacked` (Apilada): foto arriba, texto abajo y una rama de fondo.
 * - `curved` (Curva): foto a la izquierda con el borde derecho curvo.
 * El diseño depende del ANCHO DE LA TARJETA (container queries, desde 48rem), no de la
 * pantalla: en el celular las tres ponen la foto arriba, y la vista previa del panel la
 * muestra igual que la web. `preview`: sin link y con archivos locales sin optimizar.
 * Sin <article> adentro del link: Chrome no usaría su texto como nombre del link.
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
  const content = <CardBody post={post} priority={priority} preview={preview} />;
  const className = "@container group block rounded-[1.75rem] focus-visible:outline-offset-4";

  return preview ? (
    <div className={className}>{content}</div>
  ) : (
    <Link href={`/novedades/${post.slug}`} className={className}>
      {content}
    </Link>
  );
}

function CardBody({ post, priority, preview }: { post: CardPost; priority: boolean; preview: boolean }) {
  const layout = post.cardLayout;
  const Heading: ElementType = preview ? "p" : "h2";
  const image = post.media.type === "video" ? post.media.posterUrl : post.media.url;

  const photo = (
    <>
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        unoptimized={preview}
        sizes="(min-width: 1024px) 44rem, 100vw"
        className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      {post.media.type === "video" && (
        <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-espresso/80 px-3 py-1 text-xs font-semibold text-cream backdrop-blur-sm">
          <Play aria-hidden className="size-3.5 fill-current" />
          Video
        </span>
      )}
    </>
  );

  const text = (
    <>
      {newsShortDate(post) && (
        <p className="flex items-center gap-2.5 text-[0.95rem] text-muted-foreground @3xl:text-base">
          <CalendarDays aria-hidden strokeWidth={1.7} className="size-5 text-olive" />
          {newsShortDate(post)}
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
      <p
        className={cn(
          "line-clamp-3 text-[1rem] leading-relaxed text-muted-foreground @3xl:text-[1.05rem]",
          layout === "stacked" ? "max-w-[36rem]" : "max-w-[30rem]",
        )}
      >
        {newsExcerpt(post.description, 170) || "Un resumen de la novedad."}
      </p>
      <ReadMore />
    </>
  );

  const shell =
    "relative overflow-hidden rounded-[1.75rem] border border-caramel/20 bg-card shadow-[0_24px_60px_-40px_rgb(72_54_41/0.55)] transition-shadow duration-500 group-hover:shadow-[0_30px_70px_-36px_rgb(72_54_41/0.6)]";

  if (layout === "stacked") {
    return (
      <div data-layout="stacked" className={shell}>
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary @3xl:aspect-[24/7]">
          {photo}
          <div className="absolute top-5 left-5 flex items-center gap-3 @3xl:top-8 @3xl:left-10">
            <Badge tone="glass" />
            <span aria-hidden className="hidden h-px w-14 bg-cream/70 @md:block" />
          </div>
        </div>
        <div className="relative flex flex-col gap-2.5 px-6 pt-5 pb-6 @3xl:gap-3 @3xl:px-10 @3xl:pt-6 @3xl:pb-8">
          <Branch className="pointer-events-none absolute -right-8 -bottom-8 h-[70%] text-caramel/35 @3xl:right-2 @3xl:-bottom-10 @3xl:h-[150%] @3xl:text-caramel/60" />
          <div className="relative flex flex-col gap-2.5 @3xl:gap-3">{text}</div>
        </div>
      </div>
    );
  }

  if (layout === "curved") {
    return (
      <div data-layout="curved" className={cn(shell, "@3xl:grid @3xl:grid-cols-[1.12fr_1fr]")}>
        <div className="relative aspect-[16/10] overflow-hidden bg-secondary [clip-path:ellipse(135%_100%_at_50%_0%)] @3xl:aspect-auto @3xl:min-h-[19rem] @3xl:[clip-path:ellipse(100%_125%_at_0%_50%)]">
          {photo}
        </div>
        <div className="flex flex-col justify-center gap-2.5 px-6 pt-3 pb-6 @3xl:gap-3.5 @3xl:py-8 @3xl:pr-10 @3xl:pl-6">
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
    <div data-layout="split" className={cn(shell, "@3xl:grid @3xl:grid-cols-[1.4fr_1fr]")}>
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary @3xl:aspect-auto @3xl:min-h-[19rem] @3xl:rounded-[1.75rem]">
        {photo}
        <div className="absolute top-5 left-5 @3xl:top-8 @3xl:left-8">
          <Badge tone="glass" />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2.5 px-6 pt-5 pb-6 @3xl:gap-3.5 @3xl:px-10 @3xl:py-8">
        {text}
      </div>
    </div>
  );
}

/** Rótulo "Novedades" con el megáfono. `glass`: sobre la foto; `solid`: sobre el fondo. */
function Badge({ tone }: { tone: "glass" | "solid" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[0.95rem] font-medium text-cream @3xl:px-5 @3xl:py-2.5 @3xl:text-base",
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

function ReadMore(): ReactNode {
  return (
    <span className="mt-1 inline-flex items-center gap-4 self-start border-b border-olive pb-1 font-serif text-[1.25rem] text-olive @3xl:mt-2 @3xl:text-[1.4rem]">
      Leer más
      <MoveRight
        aria-hidden
        strokeWidth={1.4}
        className="size-6 transition-transform duration-300 ease-soft group-hover:translate-x-1.5 motion-reduce:transition-none"
      />
    </span>
  );
}

/** Rama con hojas (decorativa, trazo y relleno suaves en caramelo). */
function Branch({ className }: { className?: string }) {
  const leaves = [
    { x: 118, y: 40, r: -32, s: 1 },
    { x: 84, y: 92, r: 28, s: 0.95 },
    { x: 140, y: 120, r: -50, s: 1.05 },
    { x: 92, y: 170, r: 38, s: 0.9 },
    { x: 152, y: 196, r: -58, s: 0.95 },
    { x: 108, y: 238, r: 24, s: 0.85 },
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 300"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      className={className}
    >
      <path d="M190 300 C 160 240, 140 190, 128 130 S 112 40, 120 0" strokeWidth="2" />
      {leaves.map((leaf, i) => (
        <g key={i} transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.r}) scale(${leaf.s})`}>
          <path
            d="M0 0 C 14 -18, 46 -20, 62 0 C 46 20, 14 18, 0 0 Z"
            fill="currentColor"
            fillOpacity="0.28"
            strokeWidth="1.4"
          />
          <path d="M2 0 L 58 0" strokeWidth="1" />
          {[14, 26, 38].map((vx) => (
            <path key={vx} d={`M${vx} 0 l 8 -7 M${vx} 0 l 8 7`} strokeWidth="0.8" />
          ))}
        </g>
      ))}
    </svg>
  );
}
