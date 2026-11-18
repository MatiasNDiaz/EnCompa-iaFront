import type { StaticImageData } from "next/image";

import { BRAND_IMAGES } from "@/assets/brand";
import { getMediaUrl } from "@/lib/storage/media";

export type CategoryImage = {
  src: string | StaticImageData;
  /** Foto de banco (no es un plato del local): se rotula "Imagen ilustrativa". */
  isStock: boolean;
  /** Sin foto: textura de marca + rótulo "Foto pendiente". */
  isPending: boolean;
};

/**
 * Banner de una sección: la foto y el rótulo salen de la BASE (categories.image_path e
 * image_is_illustrative), editables desde el panel. Sin foto: textura de marca.
 * (Las fotos iniciales se cargan con `npm run media:banners` en EnCompa-iaBack.)
 */
export function getCategoryImage(
  category: { image_path: string | null; image_is_illustrative?: boolean },
  index = 0,
): CategoryImage {
  const url = getMediaUrl(category.image_path);
  if (url) return { src: url, isStock: Boolean(category.image_is_illustrative), isPending: false };

  return {
    src: index % 2 === 0 ? BRAND_IMAGES.texturaEspresso : BRAND_IMAGES.texturaTerracota,
    isStock: false,
    isPending: true,
  };
}
