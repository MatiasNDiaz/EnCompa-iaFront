import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logos oficiales en SVG (exportados del original, nunca redibujados ni reemplazados
 * por texto). Las versiones "claras" son crema: usarlas solo sobre fondos oscuros.
 */
const LOGOS = {
  /** Oscuro, con bajada del logo · sobre crema. */
  dark: { src: "/brand/logo-principal-oscuro.svg", width: 392, height: 162 },
  /** Crema, con bajada · sobre foto u oscuro. */
  lightWithTagline: { src: "/brand/logo-claro-con-bajada.svg", width: 396, height: 162 },
  /** Crema, sin bajada · sobre oscuro. */
  light: { src: "/brand/logo-claro-sin-bajada.svg", width: 392, height: 134 },
  /** Sello ovalado crema · decorativo sobre oscuro. */
  seal: { src: "/brand/sello-ovalado-claro.svg", width: 357, height: 259 },
  /** Claim manuscrito oscuro · sobre crema. */
  claim: { src: "/brand/slogan-y-copa-oscuro.svg", width: 570, height: 277 },
} as const;

type BrandLogoProps = {
  variant: keyof typeof LOGOS;
  className?: string;
  /** Repeticiones decorativas: alt vacío y oculto para lectores de pantalla. */
  decorative?: boolean;
  priority?: boolean;
};

export function BrandLogo({
  variant,
  className,
  decorative = false,
  priority = false,
}: BrandLogoProps) {
  const logo = LOGOS[variant];
  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={
        decorative ? "" : variant === "claim" ? "Donde los encuentros saben mejor." : "En Compañía"
      }
      aria-hidden={decorative || undefined}
      // SVG: se sirve tal cual (el optimizador de imágenes no procesa SVG).
      unoptimized
      priority={priority}
      className={cn("h-auto", className)}
    />
  );
}
