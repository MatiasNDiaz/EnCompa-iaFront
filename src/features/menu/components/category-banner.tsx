import Image from "next/image";
import type { ReactNode } from "react";

import { IllustrativeTag } from "@/components/shared/media-image";
import { cn } from "@/lib/utils";

import type { CategoryImage } from "../category-image";

type CategoryBannerProps = {
  image: CategoryImage;
  title: ReactNode;
  /** h1 en el detalle, h2 en el listado. */
  as?: "h1" | "h2";
  eyebrow?: string;
  /** Subtítulo llamativo bajo el título (categories.description). */
  subtitle?: string | null;
  size?: "list" | "hero";
  priority?: boolean;
  className?: string;
};

/**
 * Banner fotográfico de categoría (referencia del cliente): título crema a la izquierda
 * sobre espresso, la foto ocupa la parte derecha y se funde con un degradado.
 * Así la foto necesita ~60% del ancho (las fotos de banco no se estiran ni se pixelan).
 */
export function CategoryBanner({
  image,
  title,
  as: Heading = "h2",
  eyebrow,
  subtitle,
  size = "list",
  priority = false,
  className,
}: CategoryBannerProps) {
  const hero = size === "hero";

  return (
    <div
      className={cn(
        "group relative isolate flex items-center overflow-hidden bg-espresso",
        hero ? "min-h-56 md:min-h-80" : "min-h-36 rounded-2xl py-6 sm:min-h-40 md:min-h-48",
        className,
      )}
    >
      {/* Foto a la derecha. Sin "tajo" en el hover:
          - overflow-hidden: el zoom nunca sale de este contenedor;
          - la MÁSCARA desvanece la propia foto hacia la izquierda (se ve el espresso de
            fondo), así no existe ningún borde de imagen que pueda quedar expuesto;
          - el zoom crece desde la derecha (origin-right), lejos del fundido. */}
      <div
        className={cn(
          "absolute inset-y-0 right-0 -z-20 overflow-hidden",
          "[mask-image:linear-gradient(90deg,transparent_0%,rgb(0_0_0/0.55)_28%,black_60%)]",
          hero ? "w-[78%] md:w-[62%]" : "w-[72%] md:w-[60%]",
        )}
      >
        <Image
          src={image.src}
          alt=""
          fill
          sizes={hero ? "(min-width: 768px) 62vw, 78vw" : "(min-width: 1024px) 38rem, 72vw"}
          priority={priority}
          placeholder={typeof image.src === "string" ? "empty" : "blur"}
          className="origin-right object-cover transition-transform duration-1200 ease-soft group-hover:scale-[1.05]"
        />
        {/* Velo leve para que la foto no compita con el título (crema sobre espresso 10,9:1). */}
        <div aria-hidden className="absolute inset-0 bg-espresso/15" />
      </div>

      {/* El color va en el contenedor: cn() trata `text-display` (tamaño propio) y `text-cream`
          como conflictivos y descartaría el color del título. */}
      <div
        className={cn(
          "relative px-6 text-cream [text-shadow:0_1px_14px_rgb(48_36_27/0.85)] sm:px-8",
          hero ? "container-site py-12 md:py-16" : "md:px-10",
        )}
      >
        <div className="mb-2 flex items-center gap-3 text-caramel" aria-hidden>
          <span className="size-1.5 rotate-45 bg-current" />
          <span className="h-px w-10 bg-current opacity-70" />
        </div>
        {eyebrow && <p className="eyebrow mb-3 text-caramel">{eyebrow}</p>}
        <Heading
          className={
            hero ? "font-serif text-display" : "font-serif text-[1.75rem] sm:text-[2rem] md:text-h2"
          }
        >
          {title}
        </Heading>
        {subtitle && (
          <p
            className={cn(
              "mt-1.5 max-w-[22ch] font-serif text-caramel italic sm:max-w-none",
              hero ? "text-xl md:text-2xl" : "text-base sm:text-lg",
            )}
          >
            {subtitle}
          </p>
        )}
      </div>

      {image.isStock && (
        <IllustrativeTag className="right-2.5 bottom-2 bg-transparent px-1 py-0 text-[0.58rem] font-normal text-cream/75 backdrop-blur-none" />
      )}
      {image.isPending && (
        <span className="eyebrow absolute right-3 bottom-3 rounded-full bg-cream/15 px-2.5 py-1 text-[0.6rem] text-cream/90 backdrop-blur-sm">
          Foto pendiente
        </span>
      )}
    </div>
  );
}
