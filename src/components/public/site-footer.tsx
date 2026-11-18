import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { SocialIcon, type SocialIconName } from "@/components/shared/social-icon";
import { ALL_NAV, SITE } from "@/config/site";
import { TodayHours } from "@/features/hours/components/today-hours";
import type { OpeningException } from "@/features/hours/schemas";
import { getSocialLinks, mailHref, phoneHref, whatsappHref } from "@/features/settings/format";
import type { SiteSettings } from "@/features/settings/queries";

/** Footer institucional. Cada dato aparece solo si existe en site_settings. */
export function SiteFooter({
  settings,
  exceptions,
}: {
  settings: SiteSettings | null;
  exceptions: OpeningException[];
}) {
  // Redes + WhatsApp, todas como íconos redondos.
  const socials: { label: string; href: string; icon: SocialIconName }[] = [
    ...getSocialLinks(settings),
    ...(settings?.whatsapp
      ? [{ label: "WhatsApp", href: whatsappHref(settings.whatsapp), icon: "whatsapp" as const }]
      : []),
  ];
  const year = new Date().getFullYear();
  // Número para llamar: el teléfono cargado o, si no hay, el del WhatsApp.
  const phone = settings?.phone ?? (settings?.whatsapp ? `+${settings.whatsapp}` : null);

  return (
    <footer className="bg-olive text-cream">
      <div className="container-site grid gap-12 py-16 md:grid-cols-[1.2fr_0.8fr_1.2fr] md:py-20">
        <div className="flex flex-col items-start gap-6">
          <BrandLogo variant="light" className="w-40" />
          <p className="max-w-xs font-serif text-2xl leading-snug italic">{SITE.claim}</p>

          {socials.length > 0 && (
            <div>
              <p className="eyebrow mb-4 text-cream">Seguinos</p>
              <ul className="flex gap-3">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.label} de ${SITE.name} (se abre en otra pestaña)`}
                      title={social.label}
                      className="inline-flex size-11 items-center justify-center rounded-full border border-cream/35 text-cream transition-[background-color,color,border-color,transform] duration-300 ease-soft hover:-translate-y-0.5 hover:border-cream hover:bg-cream hover:text-olive focus-visible:bg-cream focus-visible:text-olive"
                    >
                      <SocialIcon name={social.icon} className="size-[1.15rem]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

        <div className="text-sm">
          <p className="eyebrow mb-5 text-cream">Contacto</p>
          <ul className="flex flex-col gap-4">
            <ContactItem icon={<MapPin aria-hidden className="size-5" strokeWidth={1.6} />}>
              {settings?.address ? (
                <address className="leading-relaxed not-italic">
                  {settings.google_maps_directions_url ? (
                    <a
                      href={settings.google_maps_directions_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline-offset-4 hover:underline"
                    >
                      {settings.address}
                    </a>
                  ) : (
                    settings.address
                  )}
                </address>
              ) : (
                <span>{SITE.locality}</span>
              )}
            </ContactItem>

            {settings?.opening_hours && (
              <ContactItem icon={<Clock aria-hidden className="size-5" strokeWidth={1.6} />}>
                <TodayHours hours={settings.opening_hours} exceptions={exceptions} />
              </ContactItem>
            )}

            {phone && (
              <ContactItem icon={<Phone aria-hidden className="size-5" strokeWidth={1.6} />}>
                <a
                  href={phoneHref(phone)}
                  aria-label={`Llamar al ${phone}`}
                  className="underline-offset-4 hover:underline"
                >
                  {phone}
                </a>
              </ContactItem>
            )}

            {settings?.email && (
              <ContactItem icon={<Mail aria-hidden className="size-5" strokeWidth={1.6} />}>
                <a
                  href={mailHref(settings.email)}
                  className="break-all underline-offset-4 hover:underline"
                >
                  {settings.email}
                </a>
              </ContactItem>
            )}
          </ul>

          <Link
            href="/contacto"
            className="mt-6 inline-flex min-h-11 items-center gap-1 font-semibold underline-offset-4 hover:underline"
          >
            Cómo llegar
            <ArrowUpRight className="size-4" aria-hidden />
          </Link>
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

function ContactItem({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center text-cream">
        {icon}
      </span>
      <span className="min-w-0 leading-relaxed">{children}</span>
    </li>
  );
}
