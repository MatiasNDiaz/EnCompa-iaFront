"use client";

import { LayoutDashboard, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Error dentro del panel (Supabase no respondió, se cortó la conexión…). Sin detalles
 * técnicos: lo que ya estaba guardado no se pierde, se puede reintentar o volver al
 * inicio del panel. El código (digest) sirve para buscar el error en los logs.
 */
export function AdminError({
  error,
  reset,
  className,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  className?: string;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      role="alert"
      className={cn("mx-auto flex max-w-md flex-col items-center gap-5 py-16 text-center", className)}
    >
      <h1 className="font-serif text-3xl">Algo no salió bien</h1>
      <p className="text-muted-foreground">
        No pudimos cargar esta parte del panel. Lo que ya estaba guardado sigue a salvo. Probá
        de nuevo en unos segundos; si sigue pasando, revisá tu conexión.
      </p>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button onClick={reset} className="h-11 rounded-full px-5">
          <RotateCcw aria-hidden />
          Reintentar
        </Button>
        <Link
          href="/admin/dashboard"
          className={cn(buttonVariants({ variant: "outline" }), "h-11 rounded-full px-5")}
        >
          <LayoutDashboard aria-hidden />
          Ir al inicio del panel
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Código del error: {error.digest}</p>
      )}
    </section>
  );
}
