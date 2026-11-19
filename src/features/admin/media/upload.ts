import { compressImage } from "@/lib/storage/compress-image";
import { MEDIA_BUCKET } from "@/lib/storage/media";
import { imageProblem, type ImageChange, type ImageFolder } from "@/lib/storage/image-rules";
import { createClient } from "@/lib/supabase/client";
import { videoProblem } from "@/lib/storage/video-rules";

import { requestImageUpload, requestVideoUpload } from "./actions";

/** Estado del campo de imagen en un formulario (antes de guardar). */
export type ImageFieldValue =
  | { kind: "keep" }
  | { kind: "remove" }
  | { kind: "new"; file: File; preview: string };

/**
 * Sube la foto elegida (si hay una nueva) y devuelve el cambio para la Server Action.
 * 1. Valida en el cliente (tipo y 8 MiB) para avisar enseguida.
 * 2. La achica y la comprime en el navegador (WebP, máx. 2400 px; ver compress-image.ts).
 * 3. Pide al servidor una URL de subida firmada (requireAdmin + validación).
 * 4. Sube directo a Storage. La acción que guarda vuelve a revisar el archivo real.
 */
export async function prepareImage(
  value: ImageFieldValue,
  folder: ImageFolder,
): Promise<{ ok: true; change: ImageChange } | { ok: false; error: string }> {
  if (value.kind !== "new") return { ok: true, change: value };

  const problem = imageProblem(value.file);
  if (problem) return { ok: false, error: problem };

  const file = await compressImage(value.file);

  const ticket = await requestImageUpload({ folder, type: file.type, size: file.size });
  if (!ticket.ok) return ticket;

  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .uploadToSignedUrl(ticket.path, ticket.token, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
  if (error) return { ok: false, error: "No pudimos subir la foto. Revisá tu conexión y probá de nuevo." };

  return { ok: true, change: { kind: "new", path: ticket.path } };
}

/** Sube un video de Novedades (mismo circuito que prepareImage). Devuelve su ruta. */
export async function prepareVideo(
  file: File,
): Promise<{ ok: true; path: string } | { ok: false; error: string }> {
  const problem = videoProblem(file);
  if (problem) return { ok: false, error: problem };

  const ticket = await requestVideoUpload({ type: file.type, size: file.size });
  if (!ticket.ok) return ticket;

  const { error } = await createClient()
    .storage.from(MEDIA_BUCKET)
    .uploadToSignedUrl(ticket.path, ticket.token, file, {
      contentType: file.type,
      cacheControl: "31536000",
    });
  if (error) return { ok: false, error: "No pudimos subir el video. Revisá tu conexión y probá de nuevo." };

  return { ok: true, path: ticket.path };
}
