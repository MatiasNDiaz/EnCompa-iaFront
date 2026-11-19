import { UserRound } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { linkButtonVariants } from "@/components/shared/link-button";
import { MAIN_NAV, withExtras, type NavExtras } from "@/config/site";
import { cn } from "@/lib/utils";

import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

/**
 * Barra minimalista. Mobile: cuenta, logo centrado y menú. Desde md: logo a la izquierda,
 * navegación y "Nuestra carta" destacado.
 * `extras`: suma "Plato del día" y "Novedades" solo si hay contenido publicado.
 */
export function SiteHeader({ extras }: { extras: NavExtras }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      {/* Mobile: grilla de 3 columnas (cuenta · logo centrado · menú). Desde md: fila con el
          logo a la izquierda. */}
      <div className="container-site grid h-(--header-height) grid-cols-[1fr_auto_1fr] items-center gap-4 md:flex md:justify-between md:gap-6">
        <Link
          href="/"
          aria-label="En Compañía · Inicio"
          className="col-start-2 row-start-1 shrink-0 justify-self-center"
        >
          <BrandLogo variant="dark" priority className="w-[7.5rem] sm:w-[8.5rem]" />
        </Link>

        {/* Completa recién desde xl: con "Plato del día" y "Novedades" no entra en 1024 px. */}
        <nav aria-label="Principal" className="hidden items-center gap-6 xl:flex 2xl:gap-9">
          {withExtras(MAIN_NAV, extras)
            .filter((item) => item.href !== "/carta")
            .map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
        </nav>

        {/* contents en mobile: la cuenta y el menú pasan a ser columnas de la grilla. */}
        <div className="contents md:flex md:items-center md:gap-2">
          <Link
            href="/carta"
            className={cn(
              linkButtonVariants({ variant: "accent" }),
              "hidden min-h-11 md:inline-flex",
            )}
          >
            Nuestra carta
          </Link>
          {/* Acceso al panel. Sin prefetch: un visitante no pide rutas del panel al pasar. */}
          <Link
            href="/admin"
            prefetch={false}
            rel="nofollow"
            aria-label="Ingresar al panel"
            title="Ingresar al panel"
            className="col-start-1 row-start-1 inline-flex size-11 items-center justify-center justify-self-start rounded-full text-espresso transition-colors hover:bg-foreground/5 md:ml-1"
          >
            <UserRound aria-hidden strokeWidth={1.6} className="size-[1.4rem]" />
          </Link>
          <div className="col-start-3 row-start-1 justify-self-end md:contents">
            <MobileMenu extras={extras} />
          </div>
        </div>
      </div>
    </header>
  );
}
