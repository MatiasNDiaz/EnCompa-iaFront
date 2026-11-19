import type { NextConfig } from "next";

/**
 * Las imágenes del CMS se sirven desde la ruta pública del bucket `site-media`.
 * El host sale de NEXT_PUBLIC_SUPABASE_URL (local o remoto): no se hardcodea el project ref.
 */
const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321");
const isLocalSupabase = ["127.0.0.1", "localhost"].includes(supabaseUrl.hostname);

const nextConfig: NextConfig = {
  reactCompiler: true,
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
