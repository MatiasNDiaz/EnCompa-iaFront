import type { Metadata } from "next";

import { LOCAL_PHOTOS } from "@/assets/local";
import { SESSION_SPACE } from "@/assets/sesion";
import { PageHeader } from "@/components/public/page-header";
import { GalleryBrowser, type GalleryEntry } from "@/features/gallery/components/gallery-browser";
import { GALLERY_CATEGORIES, getGalleryItems } from "@/features/gallery/queries";
import { getTour } from "@/features/tour/queries";
import { getMediaUrl } from "@/lib/storage/media";

export const metadata: Metadata = {
  title: "Galería",
  description:
    "Recorré En Compañía antes de visitarnos: fotos y videos del espacio, el café, el tapeo, los cocktails, el equipo y los momentos.",
  alternates: { canonical: "/galeria" },
};

/**
 * Galería ÚNICA del sitio (sección 06 del cliente): fotos y videos del espacio, café,
 * tapeo, cocktails, equipo y momentos, con filtro por categoría y visor a pantalla
 * completa. Reúne lo que antes era "El espacio" (/recorrido, que ahora redirige acá):
 * las fotos del recorrido (salón, barra, rincones, detalles) entran como "Espacio".
 *
 * Galería por defecto mientras el admin no cargue fotos (ni de la galería ni del
 * recorrido): SOLO fotos reales. El salón, la barra y el cartel (sesión del 16-11) y los
 * platos de la casa. Sin renders ni imágenes del manual de marca, a pedido del cliente.
 */
const SPACE_PHOTOS: GalleryEntry[] = SESSION_SPACE.map(({ id, image, alt }) => ({
  id,
  type: "image",
  src: image.src,
  alt,
  category: "espacio",
}));

const DEFAULT_GALLERY: GalleryEntry[] = [
  ...SPACE_PHOTOS,
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
].map((item) => ({ type: "image" as const, category: "momentos", ...item }));

export default async function GalleryPage() {
  const [items, tour] = await Promise.all([getGalleryItems(), getTour()]);

  const fromGallery: GalleryEntry[] = items.map((item) => ({
    id: item.id,
    type: item.media_type === "video" ? "video" : "image",
    src: getMediaUrl(item.media_path)!,
    poster: getMediaUrl(item.poster_path),
    alt: item.title,
    caption: item.description,
    category: item.category,
  }));
  // Fotos del recorrido por ambiente: entran como "Espacio", con el ambiente en el epígrafe.
  const fromTour: GalleryEntry[] = tour.flatMap((area) =>
    area.images.map((image) => ({
      id: image.id,
      type: "image" as const,
      src: getMediaUrl(image.image_path)!,
      alt: image.title,
      caption: image.description ? `${area.title} · ${image.description}` : area.title,
      category: "espacio",
    })),
  );
  const fromCms = [...fromGallery, ...fromTour];
  const entries = fromCms.length > 0 ? fromCms : DEFAULT_GALLERY;

  return (
    <>
      <PageHeader
        eyebrow="Espacio · Café · Tapeo · Cocktails · Equipo"
        title="Galería"
        intro="Entrá. Recorré. Descubrí."
      />
      <div className="container-site pb-24 md:pb-32">
        <GalleryBrowser entries={entries} categories={GALLERY_CATEGORIES} />
      </div>
    </>
  );
}
