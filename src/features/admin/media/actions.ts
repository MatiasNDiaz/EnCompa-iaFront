"use server";

import { randomUUID } from "node:crypto";

import { requireAdmin } from "@/lib/auth/admin";
import { IMAGE_TYPES, imageProblem, isImageType, type ImageFolder } from "@/lib/storage/image-rules";
import { MEDIA_BUCKET } from "@/lib/storage/media";

const FOLDERS: ImageFolder[] = ["products", "categories", "specials"];

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
