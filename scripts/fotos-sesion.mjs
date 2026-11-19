// Optimiza las fotos de la sesión del 16-11 (originales 6000×4000 en assets-fuente/, fuera
// del repo) a WebP de 1600 px en public/images/sesion/. Quita los metadatos (EXIF/GPS).
// Se sirven tal cual (images.unoptimized en next.config.ts): por eso van livianas.
//
// Uso: npm run fotos:sesion   (sharp ya viene instalado con Next: no suma dependencias)
// Selección y motivos: docs/CREDITOS-IMAGENES.md → "Sesión de fotos del 16-11".
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

const SOURCE = "../assets-fuente/OneDrive_2026-11-19/EN COMPAÑIA 16-11";
const TARGET = "public/images/sesion";

/** [número de la sesión, archivo de salida, lado mayor en px] */
const PHOTOS = [
  // Inicio: bloque Café.
  [73, "cafe-cappuccino-croissants.webp", 1600],
  // Galería · Espacio. La 115 es también el hero desktop (reemplaza la fachada "Vermú").
  [115, "salon-banqueta-ventana.webp", 1600],
  [116, "salon-mesas.webp", 1600],
  [117, "salon-rincon-ventana.webp", 1600],
  [22, "barra-cafe.webp", 1600],
  // Capacitaciones · El equipo.
  [26, "equipo-sillon.webp", 1600],
  [30, "equipo-sillon-sonrisas.webp", 1600],
  [33, "equipo-camisa.webp", 1600],
  [38, "equipo-ronda-patio.webp", 1600],
  [39, "equipo-ronda-cuadernos.webp", 1600],
  [56, "equipo-reunion-barra.webp", 1600],
  [1, "cocina-equipo.webp", 1600],
  [10, "cocina-desde-la-puerta.webp", 1600],
  [11, "cocina-equipo-trabajando.webp", 1600],
  [54, "cocina-croquetas.webp", 1600],
  [4, "cocina-detalle-cuchillo.webp", 1600],
  [48, "cocina-detalle-salsa.webp", 1600],
];

if (!existsSync(SOURCE)) {
  console.error(`✗ No están los originales en ${SOURCE}`);
  process.exit(1);
}
mkdirSync(TARGET, { recursive: true });

let total = 0;
for (const [n, file, edge] of PHOTOS) {
  const name = n === 1 ? "EN COMPAÑIA SESIÓN 1.jpg" : `EN COMPAÑIA SESIÓN 1-${n}.jpg`;
  const info = await sharp(join(SOURCE, name))
    .rotate() // respeta la orientación de la cámara antes de descartar el EXIF
    .resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(join(TARGET, file));
  total += info.size;
  console.log(
    `✓ ${file} ← ${n} (${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB)`,
  );
}
console.log(`\n${PHOTOS.length} fotos, ${(total / 1024 / 1024).toFixed(1)} MB en ${TARGET}`);
