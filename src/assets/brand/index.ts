/**
 * Imágenes de marca (archivos en public/images/brand/).
 * - Fotos del local del manual de marca: REALES (confirmado por el cliente), sin rótulo.
 * - Render del proyecto (presentación al equipo): NO es foto, se rotula "Render del proyecto".
 * - Texturas y mockups del manual.
 *
 * Importación estática → next/image obtiene width/height y blur automáticos y genera
 * AVIF/WebP por tamaño. Cuando el admin cargue fotos desde el CMS, esas tienen prioridad.
 */
import fachadaNoche from "../../../public/images/brand/fachada-noche.webp";
import interiorSalon from "../../../public/images/brand/interior-salon.webp";
import interiorSillon from "../../../public/images/brand/interior-sillon.webp";
import mockupPapeleria from "../../../public/images/brand/mockup-papeleria.webp";
import mockupTarjeta from "../../../public/images/brand/mockup-tarjeta.webp";
import paisajeSierras from "../../../public/images/brand/paisaje-sierras.webp";
import renderSalonBarra from "../../../public/images/brand/render-salon-barra.webp";
import texturaEspresso from "../../../public/images/brand/textura-espresso.webp";
import texturaTerracota from "../../../public/images/brand/textura-terracota.webp";

export const BRAND_IMAGES = {
  /** 1402×1122 · fachada iluminada · hero desktop. */
  fachadaNoche,
  /** 1200×1600 · salón con mesas (vertical) · hero mobile, El espacio. */
  interiorSalon,
  /** 736×981 · sillón verde · tamaño chico/mediano. */
  interiorSillon,
  /** 1580×672 · papelería y delantal · bloques de identidad. */
  mockupPapeleria,
  /** 1580×672 · tarjeta con logo. */
  mockupTarjeta,
  /** 470×706 · sierras · SOLO tamaño chico (se pixela al ampliar). */
  paisajeSierras,
  /** 1376×768 · RENDER del salón y la barra (no es foto) · rotular "Render del proyecto". */
  renderSalonBarra,
  /** 909×1565 · textura papel espresso. */
  texturaEspresso,
  /** 1000×1500 · textura terracota. */
  texturaTerracota,
} as const;
