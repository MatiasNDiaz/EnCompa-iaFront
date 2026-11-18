import Image, { type StaticImageData } from "next/image";

import horizontalCrema from "../../../public/images/imagenes-actualizadas/logos-2026-actualizados/horizontal-crema_1200x476.webp";
import horizontalVerde from "../../../public/images/imagenes-actualizadas/logos-2026-actualizados/horizontal-verde_1200x476.webp";
import selloCrema from "../../../public/images/imagenes-actualizadas/logos-2026-actualizados/sello-crema_1200x864.webp";
import selloVerde from "../../../public/images/imagenes-actualizadas/logos-2026-actualizados/sello-verde_1200x864.webp";
import { cn } from "@/lib/utils";

/**
 * Logos oficiales 2026 ("Café · Tapeo · Cocktails"), archivos del cliente en
 * public/images/imagenes-actualizadas/logos-2026-actualizados/ (nunca redibujados ni
 * reemplazados por texto). Las versiones crema van solo sobre fondos oscuros.
 */
type Logo = { src: StaticImageData | string; width: number; height: number };
const raster = (image: StaticImageData): Logo => ({
  src: image,
  width: image.width,
  height: image.height,
});

const LOGOS: Record<BrandLogoProps["variant"], Logo> = {
  /** Verde, horizontal con bajada · sobre crema. */
  dark: raster(horizontalVerde),
  /** Crema, horizontal con bajada · sobre foto u oscuro. */
  lightWithTagline: raster(horizontalCrema),
  /** Crema, horizontal · sobre oscuro (el logo 2026 incluye siempre la bajada). */
  light: raster(horizontalCrema),
  /** Sello ovalado crema · decorativo sobre oscuro. */
  seal: raster(selloCrema),
  /** Sello ovalado verde · sobre crema. */
  sealDark: raster(selloVerde),
  /** Claim manuscrito oscuro · sobre crema (sin versión 2026: no menciona la bajada). */
  claim: { src: "/brand/slogan-y-copa-oscuro.svg", width: 570, height: 277 },
};

type BrandLogoProps = {
  variant: "dark" | "lightWithTagline" | "light" | "seal" | "sealDark" | "claim";
  className?: string;
  /** Ancho con que se muestra (next/image elige el archivo justo). */
  sizes?: string;
  /** Repeticiones decorativas: alt vacío y oculto para lectores de pantalla. */
  decorative?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  variant,
  className,
  sizes = "10rem",
  decorative = false,
  priority = false,
}: BrandLogoProps) {
  const logo = LOGOS[variant];
  const isSvg = typeof logo.src === "string";
  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      sizes={isSvg ? undefined : sizes}
      alt={
        decorative ? "" : variant === "claim" ? "Donde los encuentros saben mejor." : "En Compañía"
      }
      aria-hidden={decorative || undefined}
      // SVG: se sirve tal cual (el optimizador de imágenes no procesa SVG).
      unoptimized={isSvg}
      // Texto fino (la bajada): un poco más de calidad que las fotos.
      quality={85}
      priority={priority}
      className={cn("h-auto", className)}
    />
  );
}
