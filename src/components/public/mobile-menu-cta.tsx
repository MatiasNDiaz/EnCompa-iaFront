"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * "Ver carta" siempre visible en mobile (CLAUDE.md §3.1): botón fijo inferior.
 * El layout reserva espacio abajo para que no tape contenido. En /carta no hace falta.
 */
export function MobileMenuCta() {
  const pathname = usePathname();
  if (pathname.startsWith("/carta")) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
      <Link
        href="/carta"
        className="pointer-events-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold tracking-wide text-accent-foreground shadow-[0_10px_30px_-10px_rgb(72_54_41/0.55)] transition-transform active:scale-[0.97]"
      >
        <BookOpen className="size-4" aria-hidden />
        Ver carta
      </Link>
    </div>
  );
}
