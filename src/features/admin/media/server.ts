import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isImageType,
  MAX_IMAGE_BYTES,
  UPLOAD_PATH,
  type ImageFolder,
} from "@/lib/storage/image-rules";
import { MEDIA_BUCKET } from "@/lib/storage/media";
import { isVideoType, MAX_VIDEO_BYTES, VIDEO_UPLOAD_PATH } from "@/lib/storage/video-rules";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/**
 * Revisa en Storage la foto que subió el navegador: ruta generada por el panel, en la
 * carpeta correcta, tipo de imagen permitido y hasta 8 MiB. Si no cumple, la borra.
 * Devuelve un mensaje para la persona, o null si está bien.
 */
export async function verifyUploadedImage(
  supabase: Client,
  path: string,
  folder: ImageFolder,
): Promise<string | null> {
  if (!UPLOAD_PATH.test(path) || !path.startsWith(`${folder}/`)) {
    return "La foto no es válida. Volvé a subirla.";
  }

  const name = path.slice(folder.length + 1);
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list(folder, { search: name, limit: 5 });
  const file = data?.find((item) => item.name === name);
  if (error || !file) return "No encontramos la foto subida. Probá de nuevo.";

  const size = Number(file.metadata?.size ?? 0);
  const type = String(file.metadata?.mimetype ?? "");
  if (!isImageType(type) || size <= 0 || size > MAX_IMAGE_BYTES) {
    await removeImages(supabase, [path]);
    return size > MAX_IMAGE_BYTES
      ? "La foto pesa más de 8 MB. Probá con una más liviana."
      : "Esa imagen no sirve: subí una foto JPG, PNG, WebP o AVIF.";
  }
  return null;
}

/**
 * Igual que verifyUploadedImage, para un video de Novedades: ruta `news/<uuid>.mp4|webm`,
 * tipo MP4/WebM y hasta 50 MiB. Si no cumple, lo borra.
 */
export async function verifyUploadedVideo(supabase: Client, path: string): Promise<string | null> {
  if (!VIDEO_UPLOAD_PATH.test(path)) return "El video no es válido. Volvé a subirlo.";

  const name = path.slice("news/".length);
  const { data, error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .list("news", { search: name, limit: 5 });
  const file = data?.find((item) => item.name === name);
  if (error || !file) return "No encontramos el video subido. Probá de nuevo.";

  const size = Number(file.metadata?.size ?? 0);
  const type = String(file.metadata?.mimetype ?? "");
  if (!isVideoType(type) || size <= 0 || size > MAX_VIDEO_BYTES) {
    await removeImages(supabase, [path]);
    return size > MAX_VIDEO_BYTES
      ? "El video pesa más de 50 MB. Probá con uno más corto o más liviano."
      : "Ese video no sirve: subí un video MP4 o WebM.";
  }
  return null;
}

/**
 * Borra archivos (fotos o videos) que ya no se usan. Nunca hace fallar la operación principal: si el
 * borrado falla queda registrado (archivo huérfano) y la fila ya está guardada.
 */
export async function removeImages(supabase: Client, paths: (string | null | undefined)[]) {
  const targets = paths.filter((p): p is string => Boolean(p));
  if (targets.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(targets);
  if (error) console.error("[storage] No se pudieron borrar", targets, error.message);
}
