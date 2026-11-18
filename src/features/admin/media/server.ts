import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isImageType,
  MAX_IMAGE_BYTES,
  UPLOAD_PATH,
  type ImageFolder,
} from "@/lib/storage/image-rules";
import { MEDIA_BUCKET } from "@/lib/storage/media";
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
 * Borra fotos que ya no se usan. Nunca hace fallar la operación principal: si el
 * borrado falla queda registrado (archivo huérfano) y la fila ya está guardada.
 */
export async function removeImages(supabase: Client, paths: (string | null | undefined)[]) {
  const targets = paths.filter((p): p is string => Boolean(p));
  if (targets.length === 0) return;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(targets);
  if (error) console.error("[storage] No se pudieron borrar", targets, error.message);
}
