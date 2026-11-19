import type { StaticImageData } from "next/image";

import img01Ingresar from "../../../docs/manual/01-ingresar.webp";
import img02Inicio from "../../../docs/manual/02-inicio.webp";
import img03Mas from "../../../docs/manual/03-mas.webp";
import img04Carta from "../../../docs/manual/04-carta.webp";
import img05Seccion from "../../../docs/manual/05-seccion.webp";
import img06MenuProducto from "../../../docs/manual/06-menu-producto.webp";
import img07EditarProducto from "../../../docs/manual/07-editar-producto.webp";
import img08NuevaSeccion from "../../../docs/manual/08-nueva-seccion.webp";
import img09PlatoDelDia from "../../../docs/manual/09-plato-del-dia.webp";
import img10PlatoFormulario from "../../../docs/manual/10-plato-formulario.webp";
import img11Horarios from "../../../docs/manual/11-horarios.webp";
import img12DiaEspecial from "../../../docs/manual/12-dia-especial.webp";
import img13Novedades from "../../../docs/manual/13-novedades.webp";
import img14NovedadFormulario from "../../../docs/manual/14-novedad-formulario.webp";

/**
 * Capturas del manual (docs/manual/*.webp, del celular), por la ruta que usa
 * docs/MANUAL-PANEL.md. Se generan con tests/e2e/zz-manual-capturas.spec.ts y
 * `npm run manual:imagenes`. Si se agrega una captura al manual, sumarla acá.
 */
export const MANUAL_IMAGES: Record<string, StaticImageData> = {
  "manual/01-ingresar.webp": img01Ingresar,
  "manual/02-inicio.webp": img02Inicio,
  "manual/03-mas.webp": img03Mas,
  "manual/04-carta.webp": img04Carta,
  "manual/05-seccion.webp": img05Seccion,
  "manual/06-menu-producto.webp": img06MenuProducto,
  "manual/07-editar-producto.webp": img07EditarProducto,
  "manual/08-nueva-seccion.webp": img08NuevaSeccion,
  "manual/09-plato-del-dia.webp": img09PlatoDelDia,
  "manual/10-plato-formulario.webp": img10PlatoFormulario,
  "manual/11-horarios.webp": img11Horarios,
  "manual/12-dia-especial.webp": img12DiaEspecial,
  "manual/13-novedades.webp": img13Novedades,
  "manual/14-novedad-formulario.webp": img14NovedadFormulario,
};
