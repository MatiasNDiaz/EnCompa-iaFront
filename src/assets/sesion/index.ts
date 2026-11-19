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
import cocinaCroquetas from "../../../public/images/sesion/cocina-croquetas.webp";
import cocinaDesdeLaPuerta from "../../../public/images/sesion/cocina-desde-la-puerta.webp";
import cocinaDetalleCuchillo from "../../../public/images/sesion/cocina-detalle-cuchillo.webp";
import cocinaDetalleSalsa from "../../../public/images/sesion/cocina-detalle-salsa.webp";
import cocinaEquipoTrabajando from "../../../public/images/sesion/cocina-equipo-trabajando.webp";
import cocinaEquipo from "../../../public/images/sesion/cocina-equipo.webp";
import equipoCamisa from "../../../public/images/sesion/equipo-camisa.webp";
import equipoReunionBarra from "../../../public/images/sesion/equipo-reunion-barra.webp";
import equipoRondaCuadernos from "../../../public/images/sesion/equipo-ronda-cuadernos.webp";
import equipoRondaPatio from "../../../public/images/sesion/equipo-ronda-patio.webp";
import equipoSillonSonrisas from "../../../public/images/sesion/equipo-sillon-sonrisas.webp";
import equipoSillon from "../../../public/images/sesion/equipo-sillon.webp";
import salonBanquetaVentana from "../../../public/images/sesion/salon-banqueta-ventana.webp";
import salonMesas from "../../../public/images/sesion/salon-mesas.webp";
import salonRinconVentana from "../../../public/images/sesion/salon-rincon-ventana.webp";

type SessionPhoto = { id: string; image: StaticImageData; alt: string };

export const SESSION_PHOTOS = {
  /**
   * 2400×1600 · salón: banqueta verde, mesas y ventana · hero desktop. (El cartel
   * iluminado se probó y no entra: la columna es casi cuadrada y lo corta.)
   */
  salonBanquetaVentana,
  /** 2000×1333 · cappuccino con latte art y croissants · Inicio, bloque Café. */
  cafeCappuccinoCroissants,
} as const;

/**
 * Galería · Espacio: el salón y la barra. Los carteles iluminados quedaron afuera: la
 * miniatura es cuadrada y siempre corta las letras.
 */
export const SESSION_SPACE: SessionPhoto[] = [
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

/** Capacitaciones · El equipo (12: filas completas en 2, 3 y 4 columnas). */
export const SESSION_TEAM: SessionPhoto[] = [
  {
    id: "equipo-ronda-cuadernos",
    image: equipoRondaCuadernos,
    alt: "El equipo en ronda, con cuadernos, durante una charla de formación",
  },
  { id: "equipo-sillon", image: equipoSillon, alt: "El equipo sentado en el salón tomando notas" },
  {
    id: "cocina-equipo-trabajando",
    image: cocinaEquipoTrabajando,
    alt: "Cocineras trabajando en la cocina",
  },
  {
    id: "equipo-camisa",
    image: equipoCamisa,
    alt: "Camisa del equipo con el logo y la frase «Donde los encuentros saben mejor»",
  },
  { id: "cocina-croquetas", image: cocinaCroquetas, alt: "El equipo de cocina armando croquetas" },
  {
    id: "equipo-sillon-sonrisas",
    image: equipoSillonSonrisas,
    alt: "Integrantes del equipo sonriendo durante una reunión",
  },
  { id: "cocina-equipo", image: cocinaEquipo, alt: "Tres cocineros preparando en la mesada" },
  {
    id: "equipo-ronda-patio",
    image: equipoRondaPatio,
    alt: "El equipo reunido en el patio, de espaldas con el logo en la camisa",
  },
  {
    id: "cocina-detalle-salsa",
    image: cocinaDetalleSalsa,
    alt: "Salsa recién hecha cayendo de la espátula",
  },
  {
    id: "equipo-reunion-barra",
    image: equipoReunionBarra,
    alt: "Reunión en la barra, bajo el cartel del café",
  },
  {
    id: "cocina-desde-la-puerta",
    image: cocinaDesdeLaPuerta,
    alt: "La cocina vista desde la puerta, con el equipo trabajando",
  },
  {
    id: "cocina-detalle-cuchillo",
    image: cocinaDetalleCuchillo,
    alt: "Manos cortando un huevo sobre la tabla",
  },
];
