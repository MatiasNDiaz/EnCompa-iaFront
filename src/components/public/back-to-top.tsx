"use client";

import { MoveUp } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** A partir de cuántos píxeles de scroll aparece el botón. */
const SHOW_AFTER = 600;

/**
 * Botón "Volver arriba": un círculo con una flecha, fijo abajo a la derecha. Aparece
 * después de bajar un poco y lleva al principio de la página (deslizando, o de golpe con
 * prefers-reduced-motion). En mobile queda a la altura del botón "Ver carta", sin taparlo.
 * Mientras está oculto no se puede enfocar ni tocar.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > SHOW_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Volver arriba"
      title="Volver arriba"
      aria-hidden={!visible || undefined}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "group fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex size-13 items-center justify-center rounded-full border border-cream/20 bg-espresso text-cream shadow-[0_12px_30px_-10px_rgb(48_36_27/0.6)]",
        "transition-[opacity,transform,background-color] duration-300 ease-soft hover:bg-olive focus-visible:bg-olive active:scale-95 motion-reduce:transition-none",
        "md:right-8 md:bottom-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      {/* Flecha larga de trazo fino, en el estilo de línea de la marca (Cormorant y Montserrat
          no traen el carácter de flecha). translate-y: la punta pesa más que el trazo; así se
          ve centrada a la vista. */}
      <MoveUp
        aria-hidden
        strokeWidth={1.4}
        className="size-6 translate-y-[0.5px] transition-transform duration-300 ease-soft group-hover:-translate-y-0.5 motion-reduce:transition-none"
      />
    </button>
  );
}
