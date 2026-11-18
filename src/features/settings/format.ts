import type { SiteSettings } from "./queries";

// Los horarios se formatean en src/features/hours/format.ts.

export type SocialLink = {
  label: string;
  href: string;
  icon: "instagram" | "facebook" | "tiktok";
};

/** Solo las redes cargadas en el CMS (sin enlaces rotos ni inventados). */
export function getSocialLinks(settings: SiteSettings | null): SocialLink[] {
  if (!settings) return [];
  const links: (Omit<SocialLink, "href"> & { href: string | null })[] = [
    { label: "Instagram", href: settings.instagram_url, icon: "instagram" },
    { label: "Facebook", href: settings.facebook_url, icon: "facebook" },
    { label: "TikTok", href: settings.tiktok_url, icon: "tiktok" },
  ];
  return links.filter((link): link is SocialLink => Boolean(link.href));
}

export const mailHref = (email: string) => `mailto:${email}`;

/** Link de WhatsApp a partir del número (solo dígitos, formato internacional). */
export const whatsappHref = (number: string) => `https://wa.me/${number.replace(/\D/g, "")}`;
export const phoneHref = (number: string) => `tel:${number.replace(/[^\d+]/g, "")}`;
