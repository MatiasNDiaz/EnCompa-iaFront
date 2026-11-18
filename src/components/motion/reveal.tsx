import type { CSSProperties, ElementType, ReactNode } from "react";

import { MOTION, type RevealVariant } from "@/config/motion";

type RevealProps = {
  children: ReactNode;
  variant?: RevealVariant;
  /** Retraso en ms (usar `staggerDelay(i)` en listas). */
  delay?: number;
  as?: ElementType;
  className?: string;
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
  ...attributes
}: RevealProps) {
  const style = {
    "--reveal-delay": `${delay}ms`,
    "--reveal-duration": `${MOTION.duration}ms`,
  } as CSSProperties;

  return (
    <Tag data-reveal={variant} style={style} className={className} {...attributes}>
      {children}
    </Tag>
  );
}
