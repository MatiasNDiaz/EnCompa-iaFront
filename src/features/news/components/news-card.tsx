import { ArrowRight, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { newsDateLabel, newsExcerpt } from "../format";
import type { NewsPost } from "../types";

/** Tarjeta de /novedades: imagen (o portada del video), fecha, título y extracto. */
export function NewsCard({ post, priority = false }: { post: NewsPost; priority?: boolean }) {
  const image = post.media.type === "video" ? post.media.posterUrl : post.media.url;
  const date = newsDateLabel(post);

  return (
    <Link
      href={`/novedades/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-caramel/25 bg-card shadow-[0_18px_40px_-32px_rgb(72_54_41/0.55)] transition-[box-shadow,transform] duration-500 ease-soft hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(72_54_41/0.6)]"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-secondary">
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1024px) 26rem, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        {post.media.type === "video" && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-espresso/80 px-3 py-1 text-xs font-semibold text-cream backdrop-blur-sm">
            <Play aria-hidden className="size-3.5 fill-current" />
            Video
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        {date && <p className="eyebrow text-olive">{date}</p>}
        <h2 className="font-serif text-[1.75rem] leading-tight text-balance">{post.title}</h2>
        <p className="line-clamp-3 text-muted-foreground">{newsExcerpt(post.description)}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-olive">
          Ver novedad
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
