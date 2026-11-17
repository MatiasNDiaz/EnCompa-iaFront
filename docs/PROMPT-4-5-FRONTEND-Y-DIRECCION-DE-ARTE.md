# Prompts 4 y 5 + Dirección de arte — resumen de requisitos y decisiones

Versión resumida de las especificaciones recibidas para las Fases 3–4 (los textos completos se
pegaron en la conversación de trabajo). Prevalece `CLAUDE.md` para el contenido del negocio.

## Prompt 4 — Frontend (Fases 3 y 4)

- Fase 3: clientes Supabase SSR (`@supabase/ssr`), `proxy.ts`, login/logout con RHF + Zod y
  errores genéricos, layout `admin/(protected)` con verificación de sesión y rol en el servidor,
  `requireAdmin()`, `create-admin.mjs`, queries públicas por feature, caché por tags.
- Fase 4: tokens de la paleta (Tailwind v4 `@theme`), Cormorant Garamond + Montserrat,
  animaciones de aparición con un `IntersectionObserver` único y configuración centralizada,
  `prefers-reduced-motion`, contenido visible sin JS, placeholders identificados, header con
  menú mobile accesible, "Ver carta" siempre visible en mobile, footer con datos solo si
  existen, las 7 páginas, lightbox accesible, SEO (metadata, OG, sitemap, robots, JSON-LD con
  datos reales), Playwright, Lighthouse mobile y capturas.

## Prompt 5 — Imágenes de marca y paleta

- Mover TIFF, PNG pesados y láminas fuera de `public/` (a `assets-fuente/`, sin borrar).
- Logos siempre en SVG; versiones claras solo sobre fondos oscuros; íconos separados sin
  alterar trazados; favicon desde el monograma EC.
- Las 8 fotos del manual son ambientación, no fotos del local.
- Contrastes WCAG calculados y reglas de uso de color (ver `DESIGN.md`).

## Documento de dirección de arte (más reciente: prevalece en diseño)

- Editorial contemporáneo, boutique, fotografía protagonista; "menos elementos, mejores
  decisiones visuales". Sin carruseles, parallax ni animaciones que distraigan.
- Fondos claros, oliva con moderación, sin grandes superficies oscuras.
- Navegación mínima: Inicio · Nuestra carta · Nosotros · El espacio · Ubicación (sin
  "Reservar": no hay sistema de reservas).
- Carta: banners fotográficos horizontales en una columna, overlay oscuro, título blanco
  centrado; productos en listados minimalistas.

### Decisiones ante diferencias entre fuentes

| Tema | Decisión |
| --- | --- |
| "La Cumbrecita" (dirección de arte) vs "La Cumbre" (`CLAUDE.md`) | Se usa **La Cumbre** (fuente de verdad del negocio). A confirmar con el cliente. |
| Navegación de 8 ítems (Prompt 4) vs 5 (dirección de arte) | 5 en desktop; Formación y Galería en menú mobile, footer y enlaces de la home. |
| Sección "Nuestro equipo" con fotos reales | No hay fotos: se presenta con la formación del equipo (concepto oficial). |
| Bandas alternadas de color (Prompt 5) vs "evitar superficies oscuras" | Oscuro solo en el footer, la sección Valores y los banners de la carta. |
| Animaciones izquierda/derecha y stagger (Prompt 4) vs "discretas" | Se mantienen, cortas (700 ms, ≤ 28 px), una sola vez. |
| Fotos por categoría en la carta (referencia) | Nueva columna `categories.image_path` (migración 05); textura del manual hasta que haya fotos. |
| Subtítulo "Sabores para disfrutar en las sierras" (referencia) | No se usa: no es texto oficial. |
