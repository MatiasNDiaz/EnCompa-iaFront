# Prompt 1 — Contexto del negocio y de la aplicación

> **Cómo usarlo:** pegalo como primer mensaje en Claude Code (VS Code), con el archivo `CLAUDE.md` ya ubicado en la raíz del repositorio. Este prompt no instala nada: solo le da a Claude el contexto del proyecto y le pide que confirme que lo entendió. El stack y la implementación van en el Prompt 2.

---

Hola Claude. Antes de escribir una sola línea de código quiero que entiendas bien el proyecto. En este mensaje te doy el contexto del negocio y de la aplicación; en el próximo te paso el stack técnico y el plan de trabajo.

En la raíz del repositorio hay un archivo `CLAUDE.md` con toda la información consolidada del cliente (textos oficiales, carta, paleta, logo, estructura de la web y datos pendientes). **Leelo completo antes de responder.** Ese archivo es la fuente de verdad del negocio: si algo de lo que te digo acá no coincide con él, avisame.

## Quiénes son

**En Compañía** es un café y bar familiar en **La Cumbre, Córdoba, Argentina**, que está por inaugurar. Lo lleva una familia que llegó desde Suiza y echó raíces en La Cumbre. El nombre resume la idea del proyecto: las personas y los momentos que se comparten.

- **Claim:** "Donde los encuentros saben mejor."
- **Descriptor:** "Café · Tapas · Cocktails" (el logo dice "Café · Tapeo · Vermú"; todavía no está definido cuál queda en la web).
- **Concepto creativo de la web:** "Entrá. Recorré. Descubrí."
- **Propuesta según el horario:** de mañana café de especialidad, brunch y pastelería; al mediodía algo rico y simple con menú del día rotativo; de tarde y noche, bar con cócteles clásicos y de autor, vinos y tapas.
- **Lo que los diferencia:** calidad de la materia prima, técnica y formación del equipo (barista con certificación SCA junto a Doppio Project, capacitación en coctelería), hospitalidad cálida y un ambiente accesible, sin pretensiones.
- **Valores:** Calidad · Conocimiento y formación · Excelencia en cada detalle · Creatividad e identidad · Hospitalidad.

## Qué es la web

Una **vidriera digital gastronómica y experiencial**, no un e-commerce ni una plantilla genérica de restaurante. Aproximadamente un **80% visual y un 20% de texto** breve y estratégico. Tiene que permitir conocer el lugar antes de visitarlo y facilitar llegar: carta, redes y ubicación a un toque.

Objetivos:
1. Presentar la identidad y la propuesta de En Compañía.
2. Mostrar el espacio con fotos reales antes de la visita.
3. Mostrar con claridad las tres áreas: café, tapas y cocktails.
4. Contar brevemente la historia y destacar la formación del equipo.
5. Facilitar el acceso a la carta, las redes sociales y la ubicación.

La mayoría de las visitas va a llegar **desde el celular, vía redes sociales**. Mobile first sin discusión, carga rápida, y el botón **"Ver carta" siempre visible**.

## Estructura del sitio

Área pública (rutas):

| Ruta | Contenido |
|---|---|
| `/` | Inicio: logo, claim, descriptor, foto o video principal, botones "Recorré el espacio" y "Ver carta". Texto de bienvenida oficial. Bloques "Nuestra propuesta": Café, Tapas, Cocktails. |
| `/recorrido` | "Recorré el espacio": fotos reales por ambiente (El salón, La barra, Nuestros rincones, Los detalles), con lightbox y navegación. Sin 360°. |
| `/carta` | Carta informativa por categorías y subcategorías. Sin carrito ni pedidos. |
| `/nosotros` | Nuestra historia, esencia, misión, visión, valores y diferenciación (textos oficiales). |
| `/capacitaciones` | "Formación y experiencia": un módulo de café y uno de coctelería, con fotos, institución, descripción y certificado ampliable. |
| `/galeria` | Fotos y videos del espacio, café, tapas, cocktails, equipo y momentos, con pantalla completa. |
| `/contacto` | Ubicación: dirección, Google Maps integrado, botón "Cómo llegar", horarios, WhatsApp/teléfono. Redes: Instagram, Facebook, TikTok. |

Área privada: un **CMS** en `/admin` para que el dueño (un único administrador, sin registro público) edite carta, precios, fotos, galería, recorrido, capacitaciones, textos institucionales y datos de contacto sin tocar código.

**Fuera de alcance:** carrito, pagos, pedidos, checkout, delivery, reservas online, inscripciones a cursos y recorrido 360°.

## Identidad visual

- **Paleta:** Crema cálido `#FEF9ED` (fondo) · Marrón espresso `#483629` (texto) · Verde oliva `#536B50` (institucional) · Terracota `#A66F4E` (acentos cálidos) · Caramelo `#C99B68` (secundario) · Bordó vermut `#782F35` (acento de coctelería).
- **Tipografías:** Cormorant Garamond para títulos, Montserrat para textos y botones.
- **Logo protagonista:** "En" manuscrito sobre "COMPAÑÍA" en serif. Hay versión sello ovalada, monograma "EC" e íconos lineales (taza, copa, plato). Se usa siempre como SVG exportado del original, nunca redibujado.
- **Sensación:** cálida, cuidada, gastronómica, cercana y sofisticada. Composición editorial, mucho aire, fotografía grande, animaciones sutiles, microinteracciones discretas. Nada de look de dashboard ni de plantilla.
- **Ambiente del local** (según los renders): vigas de madera con luz cálida, paredes verde claro, parquet, sillas verde oliva, barra de piedra iluminada con botellero retroiluminado, ventanales de hierro.

## Reglas sobre el contenido

1. **No inventes información del negocio:** ni precios, ni dirección, ni horarios, ni teléfonos, ni redes, ni certificaciones, ni reseñas. Lo que falta está listado en la sección 12 del `CLAUDE.md`.
2. **Los textos institucionales del `CLAUDE.md` son oficiales:** usalos literal, no los reescribas.
3. Donde falte contenido, usá **placeholders claramente identificados** y dejá todo editable desde el CMS.
4. Los renders del local **no son fotos reales**: si se usan como placeholder, tienen que estar marcados como tales.
5. Textos de la web en **español rioplatense con voseo** ("Recorré", "Descubrí"). Código en inglés.
6. Hay algunas **contradicciones entre las fuentes** (marcadas con ⚠️ en el `CLAUDE.md`: carta interna vs. externa, descriptor del logo vs. documentos, galería con videos). No elijas en silencio: aplicá el criterio que figura ahí y avisame.

## Lo que necesito ahora

No escribas código todavía. Respondeme con:
1. Un resumen breve (máximo 10 líneas) de lo que entendiste del negocio y de la web.
2. Las contradicciones o huecos de información que detectes y cómo proponés manejarlos.
3. Cualquier pregunta que necesites que te responda antes de arrancar con la parte técnica.

Después te paso el prompt técnico.
