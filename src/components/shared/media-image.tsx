import Image, { type StaticImageData } from "next/image";

import { getMediaUrl } from "@/lib/storage/media";
import { cn } from "@/lib/utils";

import { PhotoPlaceholder } from "./photo-placeholder";

type MediaImageProps = {
  /** Path guardado en la base (site-media). Tiene prioridad. */
  path?: string | null;
  /** Imagen de marca por defecto si no hay path. */
  fallback?: StaticImageData;
  /**
   * Rotula el fallback como "Imagen ilustrativa". Las fotos del manual de marca SON del
   * local (confirmado por el cliente): no llevan rótulo. Se usa para fotos de banco (carta).
   */
  fallbackIsIllustrative?: boolean;
  alt: string;
  /** Etiqueta del placeholder si no hay ni path ni fallback. */
  placeholderLabel: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  quality?: 75 | 85;
};

/**
 * Imagen que se llena su contenedor (posición relativa + aspect ratio en `className`).
 * Orden: foto del CMS → imagen de marca por defecto → placeholder "Foto pendiente".
 */
export function MediaImage({
  path,
  fallback,
  fallbackIsIllustrative = false,
  alt,
  placeholderLabel,
  sizes,
  priority = false,
  className,
  imageClassName,
  quality = 75,
}: MediaImageProps) {
  const url = getMediaUrl(path);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={quality}
          className={cn("object-cover", imageClassName)}
        />
      ) : fallback ? (
        <>
          <Image
            src={fallback}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            quality={quality}
            placeholder="blur"
            className={cn("object-cover", imageClassName)}
          />
          {fallbackIsIllustrative && <IllustrativeTag />}
        </>
      ) : (
        <PhotoPlaceholder label={placeholderLabel} />
      )}
    </div>
  );
}

/** Rótulo discreto: fotos de banco ("Imagen ilustrativa") o renders ("Render del proyecto"). */
export function IllustrativeTag({
  className,
  label = "Imagen ilustrativa",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute right-3 bottom-3 z-10 rounded-full bg-espresso/70 px-2.5 py-1 text-[0.65rem] font-medium tracking-wide text-cream backdrop-blur-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}
