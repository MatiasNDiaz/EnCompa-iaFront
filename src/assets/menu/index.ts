/**
 * Fotos por defecto de las categorías de la carta: imágenes de BANCO con licencia CC0
 * (dominio público, uso comercial libre, sin atribución obligatoria), obtenidas vía
 * Openverse. NO son platos de En Compañía: se rotulan como "Imagen ilustrativa".
 * Fuentes y licencias: docs/CREDITOS-IMAGENES.md.
 *
 * Cuando el admin cargue la foto real de una categoría (categories.image_path), esa
 * tiene prioridad y esta deja de usarse.
 */
import type { StaticImageData } from "next/image";

import almuerzos from "../../../public/images/menu/categorias/almuerzos.webp";
import cafeteria from "../../../public/images/menu/categorias/cafeteria.webp";
import cocteleria from "../../../public/images/menu/categorias/cocteleria.webp";
import desayunos from "../../../public/images/menu/categorias/desayunos-y-brunch.webp";
import pasteleria from "../../../public/images/menu/categorias/pasteleria.webp";
import postres from "../../../public/images/menu/categorias/postres.webp";
import sandwiches from "../../../public/images/menu/categorias/sandwiches.webp";
import tapeo from "../../../public/images/menu/categorias/tapeo-y-para-compartir.webp";

/**
 * Por slug de categoría. Estrategia visual por categoría (pedido del cliente):
 * cafetería cálida · brunch abundante y colorido · sandwiches en primer plano ·
 * tapeo para compartir · pastelería en detalle · coctelería con color intenso.
 */
export const MENU_CATEGORY_IMAGES: Record<string, StaticImageData> = {
  cafeteria,
  "desayunos-y-brunch": desayunos,
  sandwiches,
  pasteleria,
  almuerzos,
  "tapeo-y-para-compartir": tapeo,
  postres,
  cocteleria,
};
