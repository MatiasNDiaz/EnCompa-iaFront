/**
 * Fotos REALES de la sesión profesional del 16-11 (archivos en public/images/sesion/,
 * generados con `npm run fotos:sesion` desde los originales de assets-fuente/). Van sin
 * rótulo. Las fotos cargadas desde el CMS tienen prioridad sobre estas.
 * Selección y criterio (sin fotos de obra ni del local a medio terminar):
 * docs/CREDITOS-IMAGENES.md → "Sesión de fotos del 16-11".
 */
import type { StaticImageData } from "next/image";

import barraCafe from "../../../public/images/sesion/barra-cafe.webp";
import cafeCappuccinoCroissants from "../../../public/images/sesion/cafe-cappuccino-croissants.webp";
import cocinaEquipoTrabajando from "../../../public/images/sesion/cocina-equipo-trabajando.webp";
import equipoCamisa from "../../../public/images/sesion/equipo-camisa.webp";
import equipoCompleto from "../../../public/images/sesion/equipo-completo.webp";
import equipoRondaCuadernos from "../../../public/images/sesion/equipo-ronda-cuadernos.webp";
import equipoRondaPatio from "../../../public/images/sesion/equipo-ronda-patio.webp";
import equipoSillonSonrisas from "../../../public/images/sesion/equipo-sillon-sonrisas.webp";
import equipoSillon from "../../../public/images/sesion/equipo-sillon.webp";
import salonBanquetaVentana from "../../../public/images/sesion/salon-banqueta-ventana.webp";
import salonMesas from "../../../public/images/sesion/salon-mesas.webp";
import salonRinconVentana from "../../../public/images/sesion/salon-rincon-ventana.webp";

export type SessionPhoto = { image: StaticImageData; alt: string };

export const SESSION_PHOTOS = {
  /**
   * 1600×1067 · salón: banqueta verde, mesas y ventana · hero desktop. (El cartel
   * iluminado se probó y no entra: la columna es casi cuadrada y lo corta.)
   */
  salonBanquetaVentana,
  /** 1600×1067 · cappuccino con latte art y croissants · Inicio, bloque Café. */
  cafeCappuccinoCroissants,
} as const;

/**
 * Galería · Espacio: el salón y la barra. Los carteles iluminados quedaron afuera: la
 * miniatura es cuadrada y siempre corta las letras.
 */
export const SESSION_SPACE: (SessionPhoto & { id: string })[] = [
  {
    id: "salon-banqueta-ventana",
    image: salonBanquetaVentana,
    alt: "Salón con banqueta verde, mesas de madera y ventanas al jardín",
  },
  {
    id: "salon-mesas",
    image: salonMesas,
    alt: "Mesas de madera en fila junto a la banqueta del salón",
  },
  {
    id: "salon-rincon-ventana",
    image: salonRinconVentana,
    alt: "Rincón del salón junto a la ventana",
  },
  {
    id: "barra-cafe",
    image: barraCafe,
    alt: "Barra de café con la máquina de espresso y los molinos",
  },
];

/** Formación (/capacitaciones): una foto del equipo por bloque, intercaladas con el texto. */
export const FORMATION_PHOTOS = {
  /** 2000×1455 · el equipo de sala reunido en el salón (foto 24 recortada) · foto grande. */
  completo: {
    image: equipoCompleto,
    alt: "El equipo de En Compañía, con sus camisas de la marca, reunido en el sillón del salón",
  },
  conocimiento: {
    image: equipoRondaCuadernos,
    alt: "El equipo en ronda, con cuadernos, durante una charla de formación",
  },
  /** Portada de la capacitación de café mientras no se cargue una desde el CMS. */
  cafe: {
    image: equipoSillon,
    alt: "El equipo sentado en el salón, tomando notas durante una capacitación",
  },
  /** Portada de la capacitación de coctelería mientras no se cargue una desde el CMS. */
  cocteleria: {
    image: equipoRondaPatio,
    alt: "El equipo reunido en el patio, de espaldas con el logo en la camisa",
  },
  detalle: {
    image: cocinaEquipoTrabajando,
    alt: "Cocineras preparando en la cocina",
  },
  hospitalidad: {
    image: equipoSillonSonrisas,
    alt: "Integrantes del equipo sonriendo durante una reunión",
  },
  identidad: {
    image: equipoCamisa,
    alt: "Camisa del equipo con el logo y la frase «Donde los encuentros saben mejor»",
  },
} satisfies Record<string, SessionPhoto>;
