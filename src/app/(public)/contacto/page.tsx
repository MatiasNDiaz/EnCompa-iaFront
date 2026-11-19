import { ArrowUpRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { MapEmbed } from "@/components/public/map-embed";
import { PageHeader } from "@/components/public/page-header";
import { LinkButton } from "@/components/shared/link-button";
import { SocialIcon } from "@/components/shared/social-icon";
import { SITE } from "@/config/site";
import { OpeningHoursBlock } from "@/features/hours/components/opening-hours";
import { getOpeningExceptions } from "@/features/hours/queries";
import { getSocialLinks, mailHref, phoneHref, whatsappHref } from "@/features/settings/format";
import { getSiteSettings } from "@/features/settings/queries";
import { barToday } from "@/lib/time";

export const metadata: Metadata = {
  title: "Ubicación y contacto",
  description: `Cómo llegar a ${SITE.name}, en ${SITE.locality}: dirección, horarios y redes.`,
  alternates: { canonical: "/contacto" },
};

/**
 * Cada bloque aparece solo con datos reales de site_settings; si no hay, "Muy pronto…".
 * Se genera en cada visita (`connection()`): "hoy" y los días especiales de los próximos
 * 7 días dependen de la fecha. Los datos siguen en caché (tags `settings` y `hours`).
 */
export default async function ContactPage() {
  await connection();
  const [settings, exceptions] = await Promise.all([getSiteSettings(), getOpeningExceptions()]);
  const hours = settings?.opening_hours ?? null;
  const socials = getSocialLinks(settings);
  const hasAnyContact = Boolean(settings?.whatsapp || settings?.phone || settings?.email);

  return (
    <>
      <PageHeader eyebrow="Ubicación" title={SITE.locality} />

      <div className="container-site grid gap-10 pb-24 md:grid-cols-12 md:gap-16 md:pb-32">
        <div className="flex flex-col gap-10 md:col-span-5">
          <Block eager icon={<MapPin aria-hidden />} title="Dirección">
            {settings?.address ? (
              <address className="not-italic">{settings.address}</address>
            ) : (
              <Soon>Muy pronto vas a encontrar acá la dirección.</Soon>
            )}
            {settings?.google_maps_directions_url && (
              <LinkButton
                href={settings.google_maps_directions_url}
                target="_blank"
                rel="noopener noreferrer"
                arrow
                className="mt-5"
              >
                Cómo llegar
              </LinkButton>
            )}
          </Block>

          {hours && (
            <Block eager id="horarios" icon={<Clock aria-hidden />} title="Horarios">
              <OpeningHoursBlock
                hours={hours}
                exceptions={exceptions}
                today={barToday()}
                fallback={null}
              />
            </Block>
          )}

          {hasAnyContact && (
            <Block icon={<MessageCircle aria-hidden />} title="Contacto">
              <ul className="flex flex-col gap-2">
                {settings?.whatsapp && (
                  <li className="flex items-center gap-2">
                    <SocialIcon name="whatsapp" className="size-4 text-olive" />
                    <a
                      href={whatsappHref(settings.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      Escribinos por WhatsApp
                    </a>
                  </li>
                )}
                {settings?.phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="size-4 text-olive" aria-hidden />
                    <a
                      href={phoneHref(settings.phone)}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings?.email && (
                  <li className="flex items-center gap-2">
                    <Mail className="size-4 text-olive" aria-hidden />
                    <a
                      href={mailHref(settings.email)}
                      className="font-medium break-all underline-offset-4 hover:underline"
                    >
                      {settings.email}
                    </a>
                  </li>
                )}
              </ul>
            </Block>
          )}

          {socials.length > 0 && (
            <Block icon={<ArrowUpRight aria-hidden />} title="Redes">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline"
                    >
                      <SocialIcon name={social.icon} className="size-[1.1rem] text-olive" />
                      {social.label}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </Block>
          )}
        </div>

        <Reveal variant="fade" className="md:col-span-7">
          {settings?.google_maps_embed_url ? (
            <MapEmbed
              src={settings.google_maps_embed_url}
              title={`Mapa de ubicación de ${SITE.name}`}
              address={settings.address}
              className="aspect-[4/3] md:aspect-auto md:h-full md:min-h-[28rem]"
            />
          ) : (
            <div className="flex aspect-[4/3] h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-secondary/60 p-8 text-center md:min-h-[28rem]">
              <MapPin className="size-8 text-olive" aria-hidden />
              <p className="font-serif text-h3">Mapa muy pronto</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Cuando esté cargada la ubicación, vas a ver el mapa acá.
              </p>
            </div>
          )}
        </Reveal>
      </div>
    </>
  );
}

function Block({
  eager = false,
  id,
  icon,
  title,
  children,
}: {
  /** En la primera pantalla: visible sin esperar al JS (ver Reveal). */
  eager?: boolean;
  id?: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Reveal
      as="section"
      eager={eager}
      id={id}
      aria-label={title}
      className="scroll-mt-28 border-t border-border pt-6"
    >
      <h2 className="mb-4 flex items-center gap-3 font-sans text-sm font-semibold tracking-[0.14em] uppercase [&_svg]:size-5 [&_svg]:text-olive">
        {icon}
        {title}
      </h2>
      <div className="text-lead">{children}</div>
    </Reveal>
  );
}

function Soon({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}
