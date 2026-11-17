import type { ReactNode } from "react";

/**
 * Se vuelve a montar en cada navegación entre secciones de la carta (Anterior / Siguiente):
 * la sección entra con un fundido + deslizamiento corto (sin animación con
 * prefers-reduced-motion). El scroll al tope lo maneja <ScrollToTop /> del layout público.
 */
export default function MenuCategoryTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="motion-safe:animate-in motion-safe:duration-500 motion-safe:ease-out motion-safe:fade-in motion-safe:slide-in-from-bottom-6">
      {children}
    </div>
  );
}
