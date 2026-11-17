import type { StaticImageData } from "next/image";

import { BRAND_IMAGES } from "@/assets/brand";
import { LOCAL_CATEGORY_PHOTOS } from "@/assets/local";
import { MENU_CATEGORY_IMAGES } from "@/assets/menu";
import { getMediaUrl } from "@/lib/storage/media";

export type CategoryImage = {
  src: string | StaticImageData;
  /** Foto de banco (no es un plato del local): se rotula "Imagen ilustrativa". */
  isStock: boolean;
  /** Sin ninguna foto: textura de marca + rótulo "Foto pendiente". */
  isPending: boolean;
};

/** Foto del CMS → foto real del local → foto de banco CC0 → textura de marca. */
export function getCategoryImage(
  category: { slug: string; image_path: string | null },
  index = 0,
): CategoryImage {
  const url = getMediaUrl(category.image_path);
  if (url) return { src: url, isStock: false, isPending: false };

  const local = LOCAL_CATEGORY_PHOTOS[category.slug];
  if (local) return { src: local, isStock: false, isPending: false };

  const stock = MENU_CATEGORY_IMAGES[category.slug];
  if (stock) return { src: stock, isStock: true, isPending: false };

  return {
    src: index % 2 === 0 ? BRAND_IMAGES.texturaEspresso : BRAND_IMAGES.texturaTerracota,
    isStock: false,
    isPending: true,
  };
}
