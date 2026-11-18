import { siFacebook, siInstagram, siTiktok, siWhatsapp } from "simple-icons";

import { cn } from "@/lib/utils";

/**
 * Logos oficiales de las redes (Simple Icons, CC0): el trazado real de cada marca, en un
 * solo color (`currentColor`) para que tomen la paleta del sitio.
 */
const ICONS = {
  instagram: siInstagram,
  facebook: siFacebook,
  tiktok: siTiktok,
  whatsapp: siWhatsapp,
} as const;

export type SocialIconName = keyof typeof ICONS;

export function SocialIcon({ name, className }: { name: SocialIconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={cn("size-5 shrink-0", className)}
    >
      <path d={ICONS[name].path} />
    </svg>
  );
}
