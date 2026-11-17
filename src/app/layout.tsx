import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";

import { RevealObserver } from "@/components/motion/reveal-observer";
import { SITE } from "@/config/site";

import "./globals.css";

// next/font: se descargan en build y se sirven desde el propio dominio (sin requests a Google).
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.descriptor}`,
    template: `%s · ${SITE.name}`,
  },
  description: `${SITE.descriptor} en ${SITE.locality}. ${SITE.claim}`,
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE.name,
  },
};

export const viewport: Viewport = {
  themeColor: "#fef9ed",
};

/** Marca <html> con `.js` antes del primer pintado: solo entonces se ocultan los bloques animados. */
const JS_FLAG = "document.documentElement.classList.add('js')";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: el script JS_FLAG agrega `.js` a <html> antes de hidratar (intencional).
    <html
      lang="es-AR"
      className={`${cormorant.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: JS_FLAG }} />
      </head>
      <body className="min-h-dvh">
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
