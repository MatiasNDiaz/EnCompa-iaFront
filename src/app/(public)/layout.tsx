import { MobileMenuCta } from "@/components/public/mobile-menu-cta";
import { ScrollToTop } from "@/components/public/scroll-to-top";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { getSiteSettings } from "@/features/settings/queries";
import { getPublishedSpecials } from "@/features/specials/queries";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const [settings, specials] = await Promise.all([getSiteSettings(), getPublishedSpecials()]);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>
      {/* El ítem "Plato del día" solo aparece si hay al menos uno publicado. */}
      <SiteHeader showSpecials={specials.length > 0} />
      {/* pb en mobile: espacio para el botón fijo "Ver carta" (no tapa contenido). */}
      <main id="contenido" className="pb-24 md:pb-0">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <MobileMenuCta />
      <ScrollToTop />
    </>
  );
}
