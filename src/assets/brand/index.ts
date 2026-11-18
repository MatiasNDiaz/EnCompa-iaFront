/**
 * Imágenes de marca (archivos en public/images/brand/).
 * - Fotos del local del manual de marca: REALES (confirmado por el cliente), sin rótulo.
 * - Render del proyecto (presentación al equipo): NO es foto, se rotula "Render del proyecto".
 * - Texturas del manual.
 *
 * La fachada de noche y los mockups de papelería y tarjeta mostraban la marca vieja
 * ("Café · Tapeo · Vermú"): no se usan más y se movieron a assets-fuente/marca-vieja-vermu/.
 *
 * Importación estática → next/image obtiene width/height y blur automáticos y genera
 * AVIF/WebP por tamaño. Cuando el admin cargue fotos desde el CMS, esas tienen prioridad.
 */
import interiorSalon from "../../../public/images/brand/interior-salon.webp";
import interiorSillon from "../../../public/images/brand/interior-sillon.webp";
import paisajeSierras from "../../../public/images/brand/paisaje-sierras.webp";
import renderSalonBarra from "../../../public/images/brand/render-salon-barra.webp";
import texturaEspresso from "../../../public/images/brand/textura-espresso.webp";
import texturaTerracota from "../../../public/images/brand/textura-terracota.webp";

export const BRAND_IMAGES = {
  /** 1200×1600 · salón con mesas (vertical) · hero mobile, El espacio. */
  interiorSalon,
  /** 736×981 · sillón verde · tamaño chico/mediano. */
  interiorSillon,
  /** 470×706 · sierras · SOLO tamaño chico (se pixela al ampliar). */
  paisajeSierras,
  /** 1376×768 · RENDER del salón y la barra (no es foto) · rotular "Render del proyecto". */
  renderSalonBarra,
  /** 909×1565 · textura papel espresso · también espacio reservado para fotos nuevas. */
  texturaEspresso,
  /** 1000×1500 · textura terracota · también espacio reservado para fotos nuevas. */
  texturaTerracota,
} as const;
