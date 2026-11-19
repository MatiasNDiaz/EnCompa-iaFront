import type { MetadataRoute } from "next";

import { ALL_NAV, SITE } from "@/config/site";
import { getMenu } from "@/features/menu/queries";
import { getPublishedNews } from "@/features/news/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ALL_NAV.map((item) => ({
    url: new URL(item.href, SITE.url).toString(),
    changeFrequency: item.href === "/carta" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : item.href === "/carta" ? 0.9 : 0.7,
  }));

  // Una URL por sección de la carta.
  const categories: MetadataRoute.Sitemap = (await getMenu()).map((category) => ({
    url: new URL(`/carta/${category.slug}`, SITE.url).toString(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Novedades: solo la lista (no hay páginas de detalle), si hay alguna publicada.
  const news = await getPublishedNews();
  const newsPages: MetadataRoute.Sitemap =
    news.length > 0
      ? [
          {
            url: new URL("/novedades", SITE.url).toString(),
            lastModified: news[0].publishedAt ?? undefined,
            changeFrequency: "weekly",
            priority: 0.7,
          },
        ]
      : [];

  return [...pages, ...categories, ...newsPages];
}
