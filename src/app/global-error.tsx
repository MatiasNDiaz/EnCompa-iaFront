"use client";

import { useEffect } from "react";

import "./globals.css";

/**
 * Último recurso: falló el layout raíz. Reemplaza todo el documento (por eso trae su
 * propio <html> y <body>) y no depende de datos ni de componentes del sitio.
 */
export default function GlobalError({
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
    <html lang="es-AR">
      <body className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-foreground">
        <main className="flex max-w-md flex-col items-center gap-5 text-center">
          <h1 className="text-3xl font-semibold">En Compañía</h1>
          <p>Tuvimos un problema al cargar la página. Probá de nuevo en unos segundos.</p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
