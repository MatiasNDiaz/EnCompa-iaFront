/**
 * Reglas de videos del panel (Novedades). Igual que image-rules.ts: las usa el cliente
 * (para avisar antes de subir) y el servidor (que revisa el archivo real en Storage).
 */
export const VIDEO_TYPES = {
  "video/mp4": "mp4",
  "video/webm": "webm",
} as const;

export type VideoType = keyof typeof VIDEO_TYPES;

/** 50 MiB: el límite del bucket site-media. */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export const VIDEO_ACCEPT = Object.keys(VIDEO_TYPES).join(",");

export function isVideoType(type: string): type is VideoType {
  return type in VIDEO_TYPES;
}

/** Mensaje para la persona, o null si el video sirve. */
export function videoProblem(file: { type: string; size: number }): string | null {
  if (!isVideoType(file.type)) return "Ese video no sirve: subí un video MP4 o WebM.";
  if (file.size > MAX_VIDEO_BYTES)
    return "El video pesa más de 50 MB. Probá con uno más corto o más liviano.";
  if (file.size === 0) return "El archivo está vacío.";
  return null;
}

/** Ruta que el panel genera para cada video: `news/<uuid>.<ext>`. */
export const VIDEO_UPLOAD_PATH = /^news\/[0-9a-f-]{36}\.(mp4|webm)$/;
