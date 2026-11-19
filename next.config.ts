import type { NextConfig } from "next";

/**
 * Las imágenes del CMS se sirven desde la ruta pública del bucket `site-media`.
 * El host sale de NEXT_PUBLIC_SUPABASE_URL (local o remoto): no se hardcodea el project ref.
 */
/**
 * La URL pública del sitio es OBLIGATORIA en producción: con ella se arman el sitemap,
 * robots.txt, las URLs canónicas y las imágenes para compartir en redes. Sin ella
 * quedarían apuntando a localhost. El build (y `next start`) se detiene con un mensaje claro.
 * En el deploy de producción de Vercel, además, tiene que ser https y no local.
 */
function assertSiteUrl() {
  if (process.env.NODE_ENV !== "production") return;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site || !/^https?:\/\/[^/]+/.test(site)) {
    throw new Error(
      "Falta NEXT_PUBLIC_SITE_URL (la URL pública del sitio, por ejemplo https://tu-dominio.com). " +
        "Configurala en las variables de entorno del deploy.",
    );
  }
  if (
    process.env.VERCEL_ENV === "production" &&
    (!site.startsWith("https://") || /localhost|127\.0\.0\.1/.test(site))
  ) {
    throw new Error(`NEXT_PUBLIC_SITE_URL tiene que ser el dominio real con https (ahora: ${site}).`);
  }
}
assertSiteUrl();

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321");
const isLocalSupabase = ["127.0.0.1", "localhost"].includes(supabaseUrl.hostname);
const isDev = process.env.NODE_ENV === "development";
const siteIsHttps = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://");

/**
 * Política de contenido (CSP). Lo único externo que usa el sitio es Supabase (imágenes,
 * videos y subidas del panel con URL firmada) y el mapa de Google en Ubicación.
 * - script-src con 'unsafe-inline': Next hidrata las páginas ESTÁTICAS con scripts
 *   inline; la alternativa (nonces) obliga a renderizar cada página en cada visita.
 *   En desarrollo se suma 'unsafe-eval' (React Refresh).
 * - frame-ancestors 'none': ninguna web puede mostrar el sitio (ni el login) en un iframe.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseUrl.origin}`,
  `media-src 'self' blob: ${supabaseUrl.origin}`,
  "font-src 'self'",
  `connect-src 'self' ${supabaseUrl.origin}${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(siteIsHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS: los navegadores lo ignoran en http (local); en producción fuerza https.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // No anunciar con qué está hecho el sitio (encabezado X-Powered-By).
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // /admin/ayuda lee el manual (docs/MANUAL-PANEL.md) del disco: que viaje en el deploy.
  outputFileTracingIncludes: { "/admin/ayuda": ["./docs/MANUAL-PANEL.md"] },
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 exige declarar las calidades permitidas.
    // 60: fondos bajo overlay (hero) · 75: general · 85: fotos de producto destacadas.
    qualities: [60, 75, 85],
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol.replace(":", "") as "http" | "https",
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/site-media/**",
      },
    ],
    // Next 16 bloquea por defecto optimizar imágenes de IPs locales. Solo se habilita
    // cuando Supabase es LOCAL (desarrollo y tests); con la URL remota queda en false.
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  // Slugs viejos de la carta → nuevos (links compartidos, buscadores). Permanente (308);
  // el query (?momento=…) se conserva solo.
  async redirects() {
    return [
      {
        source: "/carta/tapas-y-para-compartir",
        destination: "/carta/tapeo-y-para-compartir",
        permanent: true,
      },
      // "El espacio" (recorrido por ambientes) se unificó con la Galería.
      { source: "/recorrido", destination: "/galeria", permanent: true },
      // Las novedades se ven completas en su tarjeta: no hay página de detalle.
      { source: "/novedades/:slug", destination: "/novedades", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
