/**
 * Imágenes de marca (archivos en public/images/brand/).
 * - Texturas del manual.
 * - La fachada de noche y el mockup de merchandising muestran la bajada vieja
 *   ("Café · Tapeo · Vermú"): el cliente pidió usarlas igual porque son las que mejor
 *   representan el lugar y la marca.
 * - interior-salon e interior-sillon (sillones beige del manual) NO son del local: no se
 *   usan en ningún lado (a pedido del cliente). render-salon-barra tampoco.
 *
 * Importación estática → next/image obtiene width/height automáticos. Cuando el admin
 * cargue fotos desde el CMS, esas tienen prioridad.
 */
import fachadaNoche from "../../../public/images/brand/fachada-noche.webp";
import merchandising from "../../../public/images/brand/merchandising.webp";
import paisajeSierras from "../../../public/images/brand/paisaje-sierras.webp";
import texturaEspresso from "../../../public/images/brand/textura-espresso.webp";
import texturaTerracota from "../../../public/images/brand/textura-terracota.webp";

export const BRAND_IMAGES = {
  /** 1402×1122 · fachada iluminada de noche (el letrero dice "Vermú") · hero desktop y mobile. */
  fachadaNoche,
  /** 1580×672 · merchandising de la marca (delantal, taza, carta, bolsa…) · Nosotros. */
  merchandising,
  /** 470×706 · sierras · SOLO tamaño chico (se pixela al ampliar). */
  paisajeSierras,
  /** 909×1565 · textura papel espresso · también espacio reservado para fotos nuevas. */
  texturaEspresso,
  /** 1000×1500 · textura terracota · también espacio reservado para fotos nuevas. */
  texturaTerracota,
} as const;
