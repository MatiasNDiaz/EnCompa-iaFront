"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ALL_NAV, withExtras, type NavExtras } from "@/config/site";
import { cn } from "@/lib/utils";

import { isActivePath } from "./nav-link";

/**
 * Menú mobile con <dialog> nativo + showModal(): foco atrapado, Esc cierra y el
 * resto de la página queda inerte, sin librerías. Se cierra al navegar.
 */
export function MobileMenu({ extras }: { extras: NavExtras }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const close = () => dialogRef.current?.close();

  // Al cambiar de página, cerrar el menú.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
        className="-mr-2 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-foreground/5 xl:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        aria-label="Menú"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Clic en el fondo (fuera del panel) cierra.
          if (event.target === dialogRef.current) close();
        }}
        className={cn(
          "fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-espresso/40 backdrop:backdrop-blur-[2px]",
          "open:flex open:justify-end",
        )}
      >
        <div className="flex h-full w-[min(22rem,88vw)] flex-col bg-background px-6 pt-5 pb-8 shadow-2xl motion-safe:animate-in motion-safe:duration-300 motion-safe:slide-in-from-right">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar menú"
              className="-mr-2 inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-foreground/5"
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>

          <nav aria-label="Principal" className="mt-6 flex flex-col">
            {withExtras(ALL_NAV, extras).map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "border-b border-border py-4 font-serif text-[1.75rem] leading-tight transition-colors",
                    active ? "text-olive" : "text-foreground hover:text-olive",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/carta"
            onClick={close}
            className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold tracking-wide text-accent-foreground"
          >
            Ver carta
          </Link>
        </div>
      </dialog>
    </>
  );
}
