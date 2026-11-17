import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { linkButtonVariants } from "@/components/shared/link-button";
import { MAIN_NAV } from "@/config/site";
import { cn } from "@/lib/utils";

import { MobileMenu } from "./mobile-menu";
import { NavLink } from "./nav-link";

/** Barra minimalista: logo a la izquierda, navegación y "Ver carta" destacado en desktop. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="container-site flex h-(--header-height) items-center justify-between gap-6">
        <Link href="/" aria-label="En Compañía · Inicio" className="shrink-0">
          <BrandLogo variant="dark" priority className="w-[7.5rem] sm:w-[8.5rem]" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex lg:gap-9">
          {MAIN_NAV.filter((item) => item.href !== "/carta").map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/carta"
            className={cn(
              linkButtonVariants({ variant: "accent" }),
              "hidden min-h-11 md:inline-flex",
            )}
          >
            Nuestra carta
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
