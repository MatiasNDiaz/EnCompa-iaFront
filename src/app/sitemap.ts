import type { MetadataRoute } from "next";

import { ALL_NAV, SITE } from "@/config/site";
import { getMenu } from "@/features/menu/queries";

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

  return [...pages, ...categories];
}
