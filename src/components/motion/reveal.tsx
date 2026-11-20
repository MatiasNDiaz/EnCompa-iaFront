import type { CSSProperties, ElementType, ReactNode } from "react";

import type { RevealVariant } from "@/config/motion";

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  /** Retraso en ms (usar `staggerDelay(i)` en listas). */
  delay?: number;
  as?: ElementType;
  className?: string;
  /**
   * Para lo que se ve en la PRIMERA pantalla: no arranca invisible ni espera al
   * JavaScript (si no, demora lo primero que ve el usuario en un celular lento). Entra con
   * un leve desplazamiento solo con CSS.
   */
  eager?: boolean;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

/**
 * Marca un bloque para aparecer al entrar en pantalla. Es un Server Component: solo
 * agrega atributos; un único observer global (RevealObserver) hace el trabajo.
 * Sin JS o con `prefers-reduced-motion`, el contenido se ve directamente.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  as: Tag = "div",
  className,
  eager = false,
  ...attributes
}: RevealProps) {
  // La duración la define globals.css (--reveal-duration): 0,5 s en mobile y 1 s desde
  // tablet. Acá solo va el retraso de cada elemento.
  const style = { "--reveal-delay": `${delay}ms` } as CSSProperties;

  // eager: atributo propio (el observer no lo toca) y animación CSS que no oculta.
  const motion = eager ? { "data-reveal-eager": "" } : { "data-reveal": variant };

  return (
    <Tag {...motion} style={style} className={className} {...attributes}>
      {children}
    </Tag>
  );
}
