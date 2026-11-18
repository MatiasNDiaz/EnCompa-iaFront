"use client";

import { useEffect } from "react";

export const UNSAVED_MESSAGE = "Tenés cambios sin guardar. ¿Querés salir igual?";

/**
 * Avisa antes de perder cambios sin guardar:
 * - al cerrar o recargar la pestaña (`beforeunload`, el navegador muestra su propio aviso);
 * - al tocar un link interno (los del panel, la sidebar o la barra inferior).
 * El botón "atrás" del navegador no se puede bloquear en el App Router.
 */
export function useUnsavedChanges(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === "_blank") return;
      if (new URL(anchor.href).origin !== window.location.origin) return;
      if (!window.confirm(UNSAVED_MESSAGE)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    // Fase de captura: antes de que <Link> de Next.js navegue.
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [isDirty]);
}
