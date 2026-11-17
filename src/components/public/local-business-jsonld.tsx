import { SITE } from "@/config/site";
import { getSocialLinks } from "@/features/settings/format";
import type { SiteSettings } from "@/features/settings/queries";

/**
 * Datos estructurados schema.org SOLO con datos reales cargados: hoy nombre, url y
 * logo; dirección, teléfono y redes se agregan solos cuando el admin los cargue.
 */
export function LocalBusinessJsonLd({ settings }: { settings: SiteSettings | null }) {
  const sameAs = getSocialLinks(settings).map((s) => s.href);

  const data = {
    "@context": "https://schema.org",
    "@type": ["CafeOrCoffeeShop", "BarOrPub"],
    name: settings?.business_name ?? SITE.name,
    url: SITE.url,
    logo: new URL("/brand/logo-principal-oscuro.svg", SITE.url).toString(),
    image: new URL("/opengraph-image.jpg", SITE.url).toString(),
    ...(settings?.address && { address: settings.address }),
    ...(settings?.phone && { telephone: settings.phone }),
    ...(settings?.google_maps_directions_url && { hasMap: settings.google_maps_directions_url }),
    ...(sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      // JSON serializado del lado del servidor; se escapa "<" para evitar inyección.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
