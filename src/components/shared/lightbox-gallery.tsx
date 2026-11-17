"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

import { cn } from "@/lib/utils";

export type LightboxItem = {
  id: string;
  type: "image" | "video";
  /** URL pública ya resuelta en el servidor. */
  src: string;
  alt: string;
  caption?: string | null;
  poster?: string | null;
};

type LightboxGalleryProps = {
  items: LightboxItem[];
  /** Clases de la grilla de miniaturas. */
  className?: string;
  /** Clases de cada miniatura (aspect ratio, etc.). */
  thumbClassName?: string;
  sizes: string;
  /** Nombre accesible de la galería (p. ej. "Fotos de El salón"). */
  label: string;
};

/**
 * Grilla de miniaturas + visor a pantalla completa accesible:
 * <dialog> nativo (foco atrapado, Esc, foco devuelto al disparador), flechas del
 * teclado, swipe en mobile, contador y botones con nombre accesible.
 */
export function LightboxGallery({
  items,
  className,
  thumbClassName,
  sizes,
  label,
}: LightboxGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const go = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const onPointerDown = (event: PointerEvent) => {
    touchStartX.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (touchStartX.current === null) return;
    const dx = event.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const current = index === null ? null : items[index];
  const many = items.length > 1;

  return (
    <>
      <ul aria-label={label} className={className}>
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Ampliar: ${item.alt}`}
              className={cn(
                "group relative block w-full overflow-hidden rounded-xl bg-secondary focus-visible:outline-offset-4",
                thumbClassName,
              )}
            >
              {(item.type === "image" || item.poster) && (
                <Image
                  src={item.type === "video" ? item.poster! : item.src}
                  alt=""
                  fill
                  sizes={sizes}
                  className="object-cover transition-transform duration-700 ease-soft group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
                />
              )}
              <span
                aria-hidden
                className="absolute inset-0 bg-espresso/0 transition-colors duration-500 group-hover:bg-espresso/15"
              />
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-cream/90 text-espresso">
                    <Play className="ml-1 size-6" aria-hidden />
                  </span>
                </span>
              )}
            </button>
            {item.caption && <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={current ? current.alt : label}
        onClose={() => setIndex(null)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-espresso/95 p-0 text-cream backdrop:bg-espresso/80"
      >
        {current && (
          <div
            className="relative flex h-full flex-col"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-6">
              <p className="text-sm tabular-nums" aria-live="polite">
                {index! + 1} / {items.length}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                autoFocus
                className="inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-cream/10"
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>

            <figure className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-2 sm:px-16">
              <div className="relative h-full w-full">
                {current.type === "video" ? (
                  <video
                    key={current.id}
                    src={current.src}
                    poster={current.poster ?? undefined}
                    controls
                    playsInline
                    preload="none"
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <Image
                    key={current.id}
                    src={current.src}
                    alt={current.alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                )}
              </div>
              {current.caption && (
                <figcaption className="px-4 py-4 text-center text-sm text-cream/85">
                  {current.caption}
                </figcaption>
              )}
            </figure>

            {many && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Anterior"
                  className="absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 transition-colors hover:bg-cream/20 sm:inline-flex"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Siguiente"
                  className="absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 transition-colors hover:bg-cream/20 sm:inline-flex"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
