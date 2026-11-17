import type { Metadata } from "next";
import Link from "next/link";

import { BrandIcon } from "@/components/shared/brand-icon";
import { BrandLogo } from "@/components/shared/brand-logo";
import { LinkButton } from "@/components/shared/link-button";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-5 py-16 text-center">
      <Link href="/" aria-label="En Compañía · Inicio">
        <BrandLogo variant="dark" className="w-36" />
      </Link>
      <BrandIcon name="taza" className="h-16 w-24 text-terracotta" />
      <div>
        <h1 className="text-h2">Esta página no está en la carta</h1>
        <p className="mt-4 text-muted-foreground">
          El enlace puede estar roto o la página ya no existe.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/">Volver al inicio</LinkButton>
        <LinkButton href="/carta" variant="outline">
          Ver carta
        </LinkButton>
      </div>
    </main>
  );
}
