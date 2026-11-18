/**
 * Reglas de imágenes del panel. Las usa el cliente (para avisar antes de subir) y el
 * servidor (que revisa el archivo real en Storage después de subirlo).
 */
export const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type ImageType = keyof typeof IMAGE_TYPES;

/** 8 MiB (el bucket admite hasta 50 MiB por los videos de la galería). */
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/** Carpetas del bucket que usa el panel de la carta y el plato del día. */
export type ImageFolder = "products" | "categories" | "specials";

export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");

export function isImageType(type: string): type is ImageType {
  return type in IMAGE_TYPES;
}

/** Mensaje para la persona, o null si la imagen sirve. */
export function imageProblem(file: { type: string; size: number }): string | null {
  if (!isImageType(file.type)) return "Esa imagen no sirve: subí una foto JPG, PNG, WebP o AVIF.";
  if (file.size > MAX_IMAGE_BYTES) return "La foto pesa más de 8 MB. Probá con una más liviana.";
  if (file.size === 0) return "El archivo está vacío.";
  return null;
}

/** Ruta que el panel genera para cada foto: `<carpeta>/<uuid>.<ext>`. */
export const UPLOAD_PATH = /^(products|categories|specials)\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/;

/** Cambio de foto que viaja con cada formulario. */
export type ImageChange = { kind: "keep" } | { kind: "remove" } | { kind: "new"; path: string };
