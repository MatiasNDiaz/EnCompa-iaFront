/**
 * Fotos y renders del local enviados por el cliente (archivos en public/images/local/).
 * - `plato-*`: FOTOS REALES de platos de En Compañía (se ve la servilleta con el logo).
 *   Van sin rótulo y tienen prioridad sobre las fotos de banco.
 * - `render-*`: RENDERS del proyecto (no son fotos): siempre con el rótulo
 *   "Render del proyecto" (CLAUDE.md §8.4).
 * Las fotos cargadas desde el CMS tienen prioridad sobre todas estas.
 */
import type { StaticImageData } from "next/image";

import platoAvocadoToast from "../../../public/images/local/plato-avocado-toast.webp";
import platoEnsalada2 from "../../../public/images/local/plato-ensalada-2.webp";
import platoEnsalada from "../../../public/images/local/plato-ensalada.webp";
import platoHuevosBenedictinos from "../../../public/images/local/plato-huevos-benedictinos.webp";
import platoSopaVerde from "../../../public/images/local/plato-sopa-verde.webp";
import platoTostadaFrutosRojos from "../../../public/images/local/plato-tostada-frutos-rojos.webp";
import renderFachadaTerraza from "../../../public/images/local/render-fachada-terraza.webp";

export const LOCAL_PHOTOS = {
  platoAvocadoToast,
  platoEnsalada,
  platoEnsalada2,
  platoHuevosBenedictinos,
  platoSopaVerde,
  platoTostadaFrutosRojos,
} as const;

/**
 * La galería ya no muestra renders (a pedido del cliente): render-salon, render-barra y
 * render-fachada-noche siguen en public/images/local/ pero no se usan. Queda solo la
 * fachada con terraza en Ubicación (home), rotulada.
 */
export const LOCAL_RENDERS = {
  renderFachadaTerraza,
} as const;

export const RENDER_CAPTION = "Render del proyecto";

/** Fotos reales por producto (slug). Prioridad: CMS → esta → foto de banco CC0. */
export const LOCAL_PRODUCT_PHOTOS: Record<string, StaticImageData> = {
  "avocado-toast": platoAvocadoToast,
  "huevos-benedictinos": platoHuevosBenedictinos,
  "french-toast": platoTostadaFrutosRojos,
};

// Los banners de la carta (incluidas las fotos reales de Desayunos y Almuerzos) ya no
// salen de acá: están en la base (categories.image_path) y en Storage. Ver
// EnCompa-iaBack/supabase/media/categories y `npm run media:banners`.
