import { ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { BRAND_IMAGES } from "@/assets/brand";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ConfirmProvider } from "@/components/ui/confirm";
import { Toaster } from "@/components/ui/toaster";
import { LogoutButton } from "@/features/auth/components/logout-button";

import { AdminNav } from "./admin-nav";

/** Fondo espresso con la textura de papel de la marca, muy sutil. */
function Texture() {
  // Contenedor propio: next/image con `fill` necesita un padre absolute/relative (la
  // sidebar es sticky).
  return (
    <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
      <Image
        src={BRAND_IMAGES.texturaEspresso}
        alt=""
        fill
        sizes="18rem"
        loading="eager"
        className="object-cover opacity-45"
      />
    </div>
  );
}

function ViewSiteLink({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      target="_blank"
      rel="noopener"
      className={
        compact
          ? "inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-cream/85 transition-colors hover:bg-cream/10 hover:text-cream"
          : "flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-[0.95rem] text-cream/75 transition-colors hover:bg-cream/5 hover:text-cream"
      }
    >
      <ExternalLink aria-hidden strokeWidth={1.6} className={compact ? "size-4" : "size-5"} />
      Ver la web
      <span className="sr-only"> (se abre en otra pestaña)</span>
    </Link>
  );
}

/**
 * Estructura del panel.
 * - Desktop (lg+): sidebar espresso fija a la izquierda, contenido sobre crema.
 * - Mobile: barra superior con el logo y "Ver la web" + barra inferior con las 4 secciones.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <Toaster>
      <ConfirmProvider>
      <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* Sidebar (desktop) */}
        <aside className="relative isolate hidden overflow-hidden bg-espresso text-cream lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
          <Texture />
          <div className="px-7 pt-9 pb-8">
            <Link href="/admin/dashboard" className="inline-block rounded-md">
              <BrandLogo variant="light" className="w-36" />
            </Link>
            <p className="eyebrow mt-4 text-caramel">Panel</p>
          </div>

          <nav aria-label="Panel" className="flex-1 overflow-y-auto px-4">
            <AdminNav variant="sidebar" />
          </nav>

          <div className="mx-4 mb-6 flex flex-col gap-1 border-t border-cream/15 pt-4">
            <ViewSiteLink />
            <LogoutButton variant="sidebar" />
          </div>
        </aside>

        {/* Barra superior (mobile) */}
        <header className="sticky top-0 isolate z-30 flex h-16 items-center justify-between overflow-hidden bg-espresso px-4 text-cream lg:hidden">
          <Texture />
          <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-md">
            <BrandLogo variant="light" className="w-24" />
            <span className="eyebrow text-caramel">Panel</span>
          </Link>
          <ViewSiteLink compact />
        </header>

        <main
          id="contenido"
          className="px-5 pt-8 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-8 lg:px-14 lg:pt-14 lg:pb-16"
        >
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>

        {/* Barra inferior (mobile) */}
        <nav
          aria-label="Panel"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-cream/10 bg-espresso pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_-12px_rgb(48_36_27/0.5)] lg:hidden"
        >
          <AdminNav variant="bar" />
        </nav>
      </div>
      </ConfirmProvider>
    </Toaster>
  );
}
