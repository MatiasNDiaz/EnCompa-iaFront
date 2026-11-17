import type { Metadata } from "next";

import { BRAND_IMAGES } from "@/assets/brand";
import { LOCAL_PHOTOS, LOCAL_RENDERS, RENDER_CAPTION } from "@/assets/local";
import { PageHeader } from "@/components/public/page-header";
import { GalleryBrowser, type GalleryEntry } from "@/features/gallery/components/gallery-browser";
import { GALLERY_CATEGORIES, getGalleryItems } from "@/features/gallery/queries";
import { getMediaUrl } from "@/lib/storage/media";

export const metadata: Metadata = {
  title: "Galería",
  description:
    "Fotos y videos del espacio, el café, las tapas, los cocktails, el equipo y los momentos de En Compañía.",
  alternates: { canonical: "/galeria" },
};

/**
 * Galería por defecto mientras el admin no cargue ítems desde el CMS: fotos reales de
 * platos y del local + renders del proyecto, rotulados como tales (CLAUDE.md §8.4).
 */
const DEFAULT_GALLERY: GalleryEntry[] = [
  {
    id: "plato-huevos-benedictinos",
    src: LOCAL_PHOTOS.platoHuevosBenedictinos.src,
    alt: "Huevos benedictinos sobre pan tostado",
  },
  {
    id: "plato-avocado-toast",
    src: LOCAL_PHOTOS.platoAvocadoToast.src,
    alt: "Avocado toast con huevo pochado y flores",
  },
  {
    id: "plato-tostada",
    src: LOCAL_PHOTOS.platoTostadaFrutosRojos.src,
    alt: "Tostada con crema y frutos rojos",
  },
  {
    id: "plato-ensalada",
    src: LOCAL_PHOTOS.platoEnsalada.src,
    alt: "Ensalada de hojas verdes, cítricos y rabanitos",
  },
  { id: "plato-sopa", src: LOCAL_PHOTOS.platoSopaVerde.src, alt: "Sopa verde con huevo pochado" },
  {
    id: "plato-ensalada-2",
    src: LOCAL_PHOTOS.platoEnsalada2.src,
    alt: "Ensalada de estación en la mesa",
  },
  {
    id: "fachada-noche",
    src: BRAND_IMAGES.fachadaNoche.src,
    alt: "Fachada de En Compañía iluminada de noche",
    category: "espacio",
  },
  {
    id: "interior-salon",
    src: BRAND_IMAGES.interiorSalon.src,
    alt: "Salón con mesas de madera",
    category: "espacio",
  },
  {
    id: "interior-sillon",
    src: BRAND_IMAGES.interiorSillon.src,
    alt: "Sillón capitoné verde oliva",
    category: "espacio",
  },
  {
    id: "render-fachada-terraza",
    src: LOCAL_RENDERS.renderFachadaTerraza.src,
    alt: "Render de la fachada con terraza",
    caption: RENDER_CAPTION,
    category: "espacio",
  },
  {
    id: "render-fachada-noche",
    src: LOCAL_RENDERS.renderFachadaNoche.src,
    alt: "Render de la fachada de noche",
    caption: RENDER_CAPTION,
    category: "espacio",
  },
  {
    id: "render-salon",
    src: LOCAL_RENDERS.renderSalon.src,
    alt: "Render del salón",
    caption: RENDER_CAPTION,
    category: "espacio",
  },
  {
    id: "render-barra",
    src: LOCAL_RENDERS.renderBarra.src,
    alt: "Render de la barra",
    caption: RENDER_CAPTION,
    category: "espacio",
  },
].map((item) => ({ type: "image" as const, category: "momentos", ...item }));

export default async function GalleryPage() {
  const items = await getGalleryItems();

  const fromCms: GalleryEntry[] = items.map((item) => ({
    id: item.id,
    type: item.media_type === "video" ? "video" : "image",
    src: getMediaUrl(item.media_path)!,
    poster: getMediaUrl(item.poster_path),
    alt: item.title,
    caption: item.description,
    category: item.category,
  }));
  const entries = fromCms.length > 0 ? fromCms : DEFAULT_GALLERY;

  return (
    <>
      <PageHeader eyebrow="Espacio · Café · Tapas · Cocktails · Equipo" title="Galería" />
      <div className="container-site pb-24 md:pb-32">
        <GalleryBrowser entries={entries} categories={GALLERY_CATEGORIES} />
      </div>
    </>
  );
}
