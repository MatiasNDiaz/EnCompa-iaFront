# Sistema de diseño — En Compañía

Fuente: `CLAUDE.md` §8, Prompt 5 (paleta e imágenes) y documento de dirección de arte
("menos elementos, mejores decisiones visuales"). Implementación: `src/app/globals.css`.

## Paleta y tokens

| Token Tailwind | HEX | Rol |
| --- | --- | --- |
| `cream` | `#FEF9ED` | Fondo general (`background`) |
| `espresso` | `#483629` | Texto (`foreground`), superficie oscura puntual (`surface`) |
| `olive` | `#536B50` | Acción principal (`primary`), foco, rótulos |
| `terracotta` | `#A66F4E` | Íconos de marca, detalles |
| `caramel` | `#C99B68` | Líneas, bordes, ornamentos (nunca texto sobre crema) |
| `vermouth` | `#782F35` | Acento (`accent`): "Ver carta"; errores del CMS (`destructive`) |

Los componentes usan **solo tokens semánticos** (`bg-background`, `text-foreground`, `bg-primary`,
`bg-accent`, `text-muted-foreground`, `bg-surface`…). Variaciones con `color-mix()` desde la
paleta (`secondary`, `muted`, `border`): no hay colores nuevos. El panel (shadcn) usa los mismos
tokens. Un solo tema (claro).

### Contraste (WCAG 2.1)

| Texto / fondo | Ratio | Uso |
| --- | --- | --- |
| Espresso / crema (y viceversa) | 10,9 | Todo texto |
| Crema / bordó | 8,9 | Botón "Ver carta" |
| Crema / oliva | 5,6 | Botones primarios |
| `muted-foreground` (espresso 82%) / crema | ≥ 7 | Texto secundario |
| Caramelo / espresso | 4,6 | Rótulos del footer |
| Crema / terracota | 4,0 | Solo texto grande (títulos de banners de la carta, con overlay) |
| Caramelo / crema | 2,4 | **Nunca texto**: líneas y ornamentos |

Texto sobre fotos: siempre con overlay espresso (hero, banners de la carta). Lighthouse
Accesibilidad: 100 en las 7 páginas.

## Tipografía

- Títulos: **Cormorant Garamond** (400/500/600, itálica para claim y citas).
- Texto, navegación y botones: **Montserrat**.
- `next/font/google`: se sirven desde el propio dominio, sin requests a Google.
- Escala fluida con `clamp()`: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-lead`.
- ⚠️ `cn()` no reconoce estos tamaños propios como tamaño de fuente y los trata como color: si
  se combinan con un color (`text-cream`) **dentro de `cn()`**, descarta uno. Poner el color en
  el contenedor o usar un string plano (no `cn`).

## Movimiento

Configuración única: `src/config/motion.ts` (duración, stagger, umbral). Variantes en
`globals.css` (`[data-reveal="up|left|right|fade|scale"]`).

- `<Reveal>` (Server Component) marca bloques; **un solo** `IntersectionObserver` global
  (`RevealObserver`) los revela **una vez**. Un `MutationObserver` suma los bloques que aparecen
  sin cambiar de ruta (p. ej. al cambiar el filtro de momento de la carta).
- Solo `transform` + `opacity`; 700 ms, desplazamientos de 24–28 px, easing suave.
- Sin JS: el estado oculto no se aplica (clase `.js` en `<html>`), el contenido se ve.
- `prefers-reduced-motion: reduce`: sin animación de aparición (verificado por test).
- El hero (LCP) no se anima. Sin carruseles ni parallax (dirección de arte).
- Hover: zoom ≤ 1.04 en fotos, subrayado animado en enlaces, flecha que se desplaza.

## Imágenes

Prioridad en todo el sitio: **foto del CMS → imagen de marca por defecto → placeholder**
("Foto pendiente · <sección>", `PhotoPlaceholder`). Nunca fotos de stock ni generadas.

Las 8 imágenes del manual (`src/assets/brand/`, importación estática → AVIF/WebP por tamaño y
blur automático): las fotos del local **son reales** (confirmado por el cliente) y van sin rótulo.

| Imagen | Dónde se usa |
| --- | --- |
| `interior-salon` (1200×1600) | Hero mobile; panorámica de "El espacio" (home); `/recorrido` → El salón (por defecto) |
| `interior-sillon` (736×981) | "Nuestra esencia" (home); `/recorrido` → Nuestros rincones (por defecto) |
| `paisaje-sierras` (470×706) | Ubicación (home), **solo tamaño chico** (≤ 19rem) |
| `textura-espresso` / `textura-terracota` | Fondo de banners de la carta sin foto; **espacios reservados** (`ImageSlot`) |

**Marca vieja ("Café · Tapeo · Vermú"):** la fachada de noche y los mockups de papelería y
tarjeta mostraban el letrero o la papelería vieja. No se usan más (están en
`assets-fuente/marca-vieja-vermu/`, fuera del repo). En su lugar queda un **espacio reservado**
(`src/components/shared/image-slot.tsx`): la textura de la paleta, del mismo tamaño y sin texto.
- Hero desktop (columna derecha): textura espresso. Se reemplaza sola cuando haya una foto en
  `site_settings.hero_media_path`.
- `/nosotros`, bloque de identidad: textura terracota. Se reemplaza con la foto del bloque
  `history` en `site_content`.
- Galería: la fachada se sacó de la lista por defecto.

### Fotos de la carta (`src/assets/menu/`)

8 fotos de banco **CC0** (dominio público), una por categoría, elegidas con la estrategia visual
del cliente (cafetería cálida, brunch colorido, sandwiches en primer plano, tapeo para compartir,
pastelería en detalle, coctelería intensa). **No son platos del local**: llevan el rótulo
"Imagen ilustrativa" (discreto). Créditos y verificación de licencia: `CREDITOS-IMAGENES.md`.

Prioridad: `categories.image_path` (CMS) → foto CC0 → textura + "Foto pendiente". También se usan
en la propuesta Café · Tapeo · Cocktails de la home mientras no haya foto en `site_content`.

## Ubicación de las imágenes

Todas las imágenes web viven en `public/images/` (pedido del cliente) y se importan de forma
estática desde `src/assets/` (tamaño y blur automáticos; Next genera AVIF/WebP por tamaño):

```text
public/images/brand/              fotos reales del local, texturas, mockups, render del proyecto
public/images/menu/categorias/    8 fotos CC0 de categoría
public/images/menu/productos/     52 fotos CC0 de producto (mapa generado: src/assets/menu/products.ts)
```

## Uso del verde oliva

Oliva para: botones primarios, rótulos (eyebrows), footer, sección Valores, tarjetas "De la casa",
precios y títulos de subcategoría de la carta, fondos suaves (oliva 9% sobre crema). **Por pedido
del cliente**, la cinta de la carta y los enlaces del navbar quedan en **marrón espresso**.

## Carta

- `/carta`: un **banner-enlace** por sección (referencia del cliente): título crema a la izquierda
  sobre espresso, la foto ocupa ~60% a la derecha. **Sin "tajo" en el hover**: el contenedor de la
  foto tiene `overflow-hidden` y el fundido es una `mask-image` sobre la propia foto (no un
  degradado encima), así el zoom nunca deja un borde expuesto.
- Productos en **tarjetas** (grilla 2 col. mobile / 3 desktop): foto (zoom contenido en la
  tarjeta), nombre, descripción y precio en oliva si existen, insignia "De la casa". Sin foto:
  tarjeta tipográfica con ícono de marca; los de autor sin foto, tarjeta oliva.
  Usar solo el 60% del ancho permite fotos de ~1000 px sin pixelarse.
- `/carta/[categoria]`: una página por sección. Botón **"Volver"** fijo arriba a la
  izquierda (sticky bajo el header), banner grande con la foto, subcategorías y productos en
  tarjetas y navegación Anterior / Siguiente. Al navegar entre secciones, `<ScrollToTop />`
  lleva el scroll al tope y `carta/[categoria]/template.tsx` hace entrar la sección con un
  fundido + deslizamiento (sin animación con prefers-reduced-motion).
- **Momentos del día** (`?momento=manana|mediodia|tarde-noche`, lógica en
  `src/features/menu/moments.ts`):
  - Tarjetas de la home ("Un mismo lugar, diferentes momentos", ubicada **antes** de "Nuestra
    propuesta"): cada una es un único link a la carta filtrada. "Ver carta →" siempre visible
    (pista táctil en mobile); con hover se desplaza y toma color oliva.
  - Selector **Todo · Mañana · Mediodía · Tarde / Noche** (`moment-filter.tsx`): chips-link sin
    JS propio, activo en espresso con `aria-current`, fila deslizable si no entra en mobile.
  - Con un momento: h1 "Carta · Mañana", bajada tomada del texto de la tarjeta y "Ver carta
    completa". La lista entra con un fundido (contenedor con `key` del momento).
  - En cada sección el momento se conserva en Volver y Anterior / Siguiente (que saltean las
    secciones de otros momentos); en la barra fija, chip "Carta · Mañana ✕" para quitarlo. Si se
    entra a una sección que no es de ese momento, se ve completa con un aviso.
  - Por leer `searchParams`, `/carta` y `/carta/[categoria]` se renderizan por visita (los datos
    siguen en la caché de fetch). Canónicas sin el parámetro.
- **Cinta** (referencia de la pizzería): las secciones reales de la carta pasan de derecha a
  izquierda separadas por una **taza humeante** (vapor animado). Solo CSS (`transform`), se pausa
  con hover/foco, quieta con `prefers-reduced-motion`, decorativa (`aria-hidden`).

Descartes por resolución: ninguna se amplía por encima de su tamaño; `paisaje-sierras` queda
limitada a tamaño chico.

## Logos e íconos

**Logos 2026** ("Café · Tapeo · Cocktails"), archivos del cliente en
`public/images/imagenes-actualizadas/logos-2026-actualizados/`, sin redibujar
(`src/components/shared/brand-logo.tsx`):

| Variante | Archivo | Uso |
| --- | --- | --- |
| `dark` | `horizontal-verde` | Header, panel, 404 (fondos claros) |
| `light` / `lightWithTagline` | `horizontal-crema` | Hero, footer (fondos oscuros) |
| `seal` | `sello-crema` ("Tapeo & Cocktails") | Sección Valores (`/nosotros`), decorativo |
| `sealDark` | `sello-verde` | Disponible para fondos claros |

Los SVG viejos con "Vermú" (logo principal, logo con bajada, bajada suelta, sello ovalado y
claim con copa) se movieron a `assets-fuente/marca-vieja-vermu/`. En `public/brand/` quedan
`logo-claro-sin-bajada.svg`, `iconos-claros.svg` y los íconos:

| Archivo | Uso |
| --- | --- |
| `icons/{taza,copa,plato,monograma-ec}.svg` | Separados de `iconos-claros.svg` recortando el `viewBox` y quitando los trazados ajenos (sin modificar los propios). Color con `currentColor` |

- Los íconos se pintan como **máscara CSS** (`BrandIcon`): heredan el color del texto y no
  inflan el HTML (inline sumaban ~20 KB por ícono al payload de hidratación).
- Favicon (`src/app/icon.svg`) y `apple-icon.png`: monograma EC en crema sobre oliva.
- `opengraph-image.jpg` (1200×630): logo 2026 crema sobre la textura espresso.
- El descriptor definitivo es **"Café · Tapeo · Cocktails"**, igual en el logo y en los textos.
