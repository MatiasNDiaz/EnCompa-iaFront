import { UserRound } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { linkButtonVariants } from "@/components/shared/link-button";
import { MAIN_NAV, withSpecials } from "@/config/site";
import { cn } from "@/lib/utils";

import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

/**
 * Barra minimalista: logo a la izquierda, navegación y "Ver carta" destacado en desktop.
 * `showSpecials`: suma "Plato del día" (ancla de la home) si hay al menos uno publicado.
 */
export function SiteHeader({ showSpecials = false }: { showSpecials?: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container-site flex h-(--header-height) items-center justify-between gap-6">
        <Link href="/" aria-label="En Compañía · Inicio" className="shrink-0">
          <BrandLogo variant="dark" priority className="w-[7.5rem] sm:w-[8.5rem]" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex lg:gap-9">
          {withSpecials(MAIN_NAV, showSpecials)
            .filter((item) => item.href !== "/carta")
            .map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
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
            className="inline-flex size-11 items-center justify-center rounded-full text-espresso transition-colors hover:bg-foreground/5 md:ml-1"
          >
            <UserRound aria-hidden strokeWidth={1.6} className="size-[1.4rem]" />
          </Link>
          <MobileMenu showSpecials={showSpecials} />
        </div>
      </div>
    </header>
  );
}
