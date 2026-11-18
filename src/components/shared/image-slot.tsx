import Image from "next/image";

import { BRAND_IMAGES } from "@/assets/brand";
import { cn } from "@/lib/utils";

const TEXTURES = {
  espresso: BRAND_IMAGES.texturaEspresso,
  terracota: BRAND_IMAGES.texturaTerracota,
} as const;

/**
 * Espacio reservado para una foto que todavía no existe: solo la textura de la paleta,
 * sin texto ni etiqueta. Ocupa el mismo tamaño que la imagen (el tamaño y la proporción
 * los da `className`), así el layout no cambia cuando se cargue la foto nueva.
 */
export function ImageSlot({
  texture = "espresso",
  className,
}: {
  texture?: keyof typeof TEXTURES;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn("relative overflow-hidden bg-espresso", className)}>
      <Image
        src={TEXTURES[texture]}
        alt=""
        fill
        sizes="(min-width: 1024px) 60vw, 100vw"
        quality={60}
        className="object-cover"
      />
    </div>
  );
}
