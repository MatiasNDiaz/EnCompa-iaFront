"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Al navegar a otra página (clic en un enlace), lleva el scroll al tope.
 *
 * Por qué: Next.js alinea el inicio de la página nueva con el borde superior de la
 * ventana, pero el header es sticky y lo tapa (p. ej. la cinta de /carta quedaba
 * escondida). Este componente lo deja siempre arriba de todo.
 *
 * - Atrás / adelante del navegador (popstate): NO interviene, se respeta la posición
 *   que el navegador restaura.
 * - Enlaces con #ancla: NO interviene.
 * - Salto inmediato (sin el smooth-scroll global) para que no se vea el recorrido.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const isHistoryNavigation = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isHistoryNavigation.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Layout effect: salta antes de pintar la página nueva (sin parpadeo).
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
