import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";
import { ALL_NAV, SITE } from "@/config/site";
import { getSocialLinks } from "@/features/settings/format";
import type { SiteSettings } from "@/features/settings/queries";

/** Footer institucional. Cada dato aparece solo si existe en site_settings. */
export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const socials = getSocialLinks(settings);
  const year = new Date().getFullYear();

  return (
    <footer className="bg-olive text-cream">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr] md:py-20">
        <div className="flex flex-col items-start gap-6">
          <BrandLogo variant="light" className="w-40" />
          <p className="max-w-xs font-serif text-2xl leading-snug italic">{SITE.claim}</p>
        </div>

        <nav aria-label="Secciones">
          <p className="eyebrow mb-5 text-cream">Secciones</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-1">
            {ALL_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-cream underline-offset-4 transition-colors hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-8 text-sm">
          <div>
            <p className="eyebrow mb-4 text-cream">Ubicación</p>
            {settings?.address ? (
              <address className="leading-relaxed text-cream not-italic">
                {settings.address}
              </address>
            ) : (
              <p className="text-cream">{SITE.locality}</p>
            )}
            <Link
              href="/contacto"
              className="mt-3 inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
            >
              Cómo llegar
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>

          {socials.length > 0 && (
            <div>
              <p className="eyebrow mb-4 text-cream">Seguinos</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline"
                    >
                      {social.label}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-cream/25">
        <p className="container-site py-6 text-xs text-cream/90">
          © {year} {SITE.name} · {SITE.descriptor}
        </p>
      </div>
    </footer>
  );
}
