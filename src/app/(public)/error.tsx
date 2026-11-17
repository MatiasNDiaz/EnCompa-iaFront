"use client";

import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

import { LinkButton } from "@/components/shared/link-button";

/** Error de una página pública (p. ej. Supabase no respondió). No muestra detalles técnicos. */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-site flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <h1 className="text-h2">No pudimos cargar esta sección</h1>
      <p className="max-w-md text-muted-foreground">Probá de nuevo en unos segundos.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          <RotateCcw className="size-4" aria-hidden />
          Reintentar
        </button>
        <LinkButton href="/" variant="outline">
          Volver al inicio
        </LinkButton>
      </div>
    </section>
  );
}
