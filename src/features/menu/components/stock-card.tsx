"use client";

import { useSyncExternalStore, type ReactNode } from "react";

import { barToday } from "@/lib/time";

/** Revisa la fecha cada minuto: si la página queda abierta, a la medianoche vuelve sola. */
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(timer);
}

/**
 * Tarjeta de un producto marcado "sin stock" alguna vez (out_of_stock_on con fecha).
 * Solo cuenta si esa fecha es HOY en Córdoba. El servidor manda su mejor estimación
 * (`initialOut`, calculada al renderizar) y el navegador la confirma con la fecha actual:
 * así una página en caché del día anterior no deja el producto atenuado.
 * Marca `data-out-of-stock` y la tarjeta (CSS) se atenúa y muestra la etiqueta.
 */
export function StockCard({
  date,
  initialOut,
  className,
  children,
}: {
  date: string;
  initialOut: boolean;
  className?: string;
  children: ReactNode;
}) {
  const out = useSyncExternalStore(
    subscribe,
    () => date === barToday(),
    () => initialOut,
  );

  return (
    <article data-out-of-stock={out || undefined} className={className}>
      {children}
    </article>
  );
}
