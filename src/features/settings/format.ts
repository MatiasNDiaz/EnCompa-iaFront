import type { SiteSettings } from "./queries";
import type { OpeningHours } from "./schemas";

const DAY_LABELS: Record<OpeningHours[number]["day"], string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

/** Filas listas para mostrar: "Lunes · 08:00 – 14:00 / 19:00 – 00:00" o "Cerrado". */
export function formatOpeningHours(hours: OpeningHours | null) {
  if (!hours || hours.length === 0) return null;
  return hours.map(({ day, ranges }) => ({
    day: DAY_LABELS[day],
    value: ranges.length ? ranges.map((r) => `${r.open} – ${r.close}`).join(" / ") : "Cerrado",
  }));
}

export type SocialLink = { label: string; href: string };

/** Solo las redes cargadas en el CMS (sin enlaces rotos ni inventados). */
export function getSocialLinks(settings: SiteSettings | null): SocialLink[] {
  if (!settings) return [];
  return [
    { label: "Instagram", href: settings.instagram_url },
    { label: "Facebook", href: settings.facebook_url },
    { label: "TikTok", href: settings.tiktok_url },
  ].filter((link): link is SocialLink => Boolean(link.href));
}

/** Link de WhatsApp a partir del número (solo dígitos, formato internacional). */
export const whatsappHref = (number: string) => `https://wa.me/${number.replace(/\D/g, "")}`;
export const phoneHref = (number: string) => `tel:${number.replace(/[^\d+]/g, "")}`;
