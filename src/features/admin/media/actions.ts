"use server";

import { randomUUID } from "node:crypto";

import { requireAdmin } from "@/lib/auth/admin";
import {
  IMAGE_TYPES,
  imageProblem,
  isImageType,
  UPLOAD_PATH,
  type ImageFolder,
} from "@/lib/storage/image-rules";
import { MEDIA_BUCKET } from "@/lib/storage/media";
import {
  isVideoType,
  VIDEO_TYPES,
  VIDEO_UPLOAD_PATH,
  videoProblem,
} from "@/lib/storage/video-rules";

const FOLDERS: ImageFolder[] = ["products", "categories", "specials", "news"];

export type UploadTicket =
  | { ok: true; path: string; token: string }
  | { ok: false; error: string };

/**
 * Paso 1 de la subida de una foto: el servidor valida tipo y tamaño declarados y entrega
 * una URL de subida FIRMADA a un nombre único. El navegador sube el archivo directo a
 * Storage (sin pasar por el servidor: Vercel limita el cuerpo de una petición a 4,5 MB).
 * Paso 2: la acción que guarda la fila revisa el archivo real (ver ./server.ts).
 *
 * La URL firmada se crea con la sesión del admin: la política de Storage vuelve a
 * exigir rol admin y una carpeta permitida.
 */
export async function requestImageUpload(input: {
  folder: ImageFolder;
  type: string;
  size: number;
}): Promise<UploadTicket> {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return { ok: false, error: "Tu sesión terminó. Volvé a ingresar." };
  }

  if (!FOLDERS.includes(input.folder)) return { ok: false, error: "Carpeta no permitida." };
  const problem = imageProblem(input);
  if (problem || !isImageType(input.type)) return { ok: false, error: problem ?? "Foto no válida." };

  const path = `${input.folder}/${randomUUID()}.${IMAGE_TYPES[input.type]}`;
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "No pudimos preparar la subida. Probá de nuevo." };

  return { ok: true, path: data.path, token: data.token };
}

/**
 * Descarta archivos que el navegador subió pero no se van a usar (por ejemplo, se subió
 * el video y falló la portada). Solo rutas generadas por el panel.
 */
export async function discardUploads(paths: string[]): Promise<void> {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return;
  }
  const valid = paths.filter((path) => UPLOAD_PATH.test(path) || VIDEO_UPLOAD_PATH.test(path));
  if (valid.length > 0) await supabase.storage.from(MEDIA_BUCKET).remove(valid);
}

/**
 * Igual que requestImageUpload, para videos de Novedades (MP4 o WebM, hasta 50 MiB).
 * Siempre van a news/: es la única sección del panel con videos.
 */
export async function requestVideoUpload(input: { type: string; size: number }): Promise<UploadTicket> {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return { ok: false, error: "Tu sesión terminó. Volvé a ingresar." };
  }

  const problem = videoProblem(input);
  if (problem || !isVideoType(input.type)) return { ok: false, error: problem ?? "Video no válido." };

  const path = `news/${randomUUID()}.${VIDEO_TYPES[input.type]}`;
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return { ok: false, error: "No pudimos preparar la subida. Probá de nuevo." };

  return { ok: true, path: data.path, token: data.token };
}
