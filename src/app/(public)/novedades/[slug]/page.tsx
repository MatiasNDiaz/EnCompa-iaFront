import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SITE } from "@/config/site";
import { NewsArticle } from "@/features/news/components/news-article";
import { newsExcerpt } from "@/features/news/format";
import { getNewsBySlug, getPublishedNews } from "@/features/news/queries";

/** Las publicadas se generan al compilar; las nuevas, en la primera visita. */
export async function generateStaticParams() {
  return (await getPublishedNews()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/novedades/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};
  const image = post.media.type === "video" ? post.media.posterUrl : post.media.url;
  const description = newsExcerpt(post.description, 155);
  return {
    title: `${post.title} · Novedades`,
    description,
    alternates: { canonical: `/novedades/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/novedades/${post.slug}`,
      siteName: SITE.name,
      images: [{ url: image, alt: post.title }],
      ...(post.publishedAt && { publishedTime: post.publishedAt }),
    },
    twitter: { card: "summary_large_image", title: post.title, description, images: [image] },
  };
}

export default async function NewsPostPage({ params }: PageProps<"/novedades/[slug]">) {
  const { slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) notFound();

  return (
    <div className="container-site pt-8 pb-24 md:pt-12 md:pb-32">
      <Link
        href="/novedades"
        className="mb-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-olive underline-offset-4 hover:underline md:mb-10"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Todas las novedades
      </Link>
      <NewsArticle post={post} />
    </div>
  );
}
