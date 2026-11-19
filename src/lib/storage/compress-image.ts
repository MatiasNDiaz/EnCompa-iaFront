/**
 * Achica y comprime una foto EN EL NAVEGADOR antes de subirla a Storage: WebP, con el
 * lado más largo en 2400 px como máximo. Una foto de celular (3–8 MB) queda en unos
 * cientos de KB: sube más rápido y ocupa menos lugar en Supabase.
 *
 * - Respeta la orientación de la foto (EXIF).
 * - Si ya es WebP y no hace falta achicarla, se sube tal cual.
 * - Si el navegador no puede generar WebP (o algo falla), se sube el original: nunca
 *   bloquea la subida. El servidor vuelve a validar tipo y tamaño igual.
 */
export const MAX_IMAGE_SIDE = 2400;
const WEBP_QUALITY = 0.82;

export async function compressImage(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.type === "image/webp") return file;

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const blob = await encodeWebp(bitmap, width, height);
    // Safari viejo devuelve PNG si no sabe generar WebP: en ese caso, el original.
    if (!blob || blob.type !== "image/webp") return file;

    const name = file.name.replace(/\.[^.]+$/, "") || "foto";
    return new File([blob], `${name}.webp`, { type: "image/webp", lastModified: Date.now() });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}

async function encodeWebp(bitmap: ImageBitmap, width: number, height: number) {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.convertToBlob({ type: "image/webp", quality: WEBP_QUALITY });
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY),
  );
}
