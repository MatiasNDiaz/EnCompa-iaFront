/**
 * Imágenes de marca (archivos en public/images/brand/).
 * - Fotos del local del manual de marca: REALES (confirmado por el cliente), sin rótulo.
 * - Render del proyecto (presentación al equipo): NO es foto, se rotula "Render del proyecto".
 * - Texturas del manual.
 *
 * Los mockups de papelería y tarjeta mostraban la marca vieja ("Café · Tapeo · Vermú"):
 * no se usan más y están en assets-fuente/marca-vieja-vermu/. La fachada de noche (su
 * letrero decía "Vermú") dejó el hero de desktop: ahora va el cartel iluminado de la
 * sesión de fotos (src/assets/sesion). fachada-noche, interior-sillon y
 * render-salon-barra siguen en public/images/brand/ pero ya no se usan.
 *
 * Importación estática → next/image obtiene width/height y blur automáticos y genera
 * AVIF/WebP por tamaño. Cuando el admin cargue fotos desde el CMS, esas tienen prioridad.
 */
import interiorSalon from "../../../public/images/brand/interior-salon.webp";
import paisajeSierras from "../../../public/images/brand/paisaje-sierras.webp";
import texturaEspresso from "../../../public/images/brand/textura-espresso.webp";
import texturaTerracota from "../../../public/images/brand/textura-terracota.webp";

export const BRAND_IMAGES = {
  /** 1200×1600 · salón con mesas (vertical) · hero mobile, adelanto de la galería. */
  interiorSalon,
  /** 470×706 · sierras · SOLO tamaño chico (se pixela al ampliar). */
  paisajeSierras,
  /** 909×1565 · textura papel espresso · también espacio reservado para fotos nuevas. */
  texturaEspresso,
  /** 1000×1500 · textura terracota · también espacio reservado para fotos nuevas. */
  texturaTerracota,
} as const;
