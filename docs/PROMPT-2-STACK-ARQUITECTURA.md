> **Nota de versionado:** documento histórico. Las decisiones posteriores (Prompt 3 y `CLAUDE.md`)
> prevalecen: p. ej. ya **no** existe `external_menu_url` (la carta es interna) y se mantienen **dos
> repositorios Git** separados (Front y Back) en lugar de uno solo.

# Prompt 2 — Stack, arquitectura e implementación inicial

# EN COMPAÑÍA — Configuración técnica, arquitectura e implementación inicial

## 0. Tu rol y cómo vamos a trabajar

Trabajá como **Senior Full Stack Developer y Software Architect** con experiencia en Next.js, TypeScript, Supabase, PostgreSQL, seguridad web y CMS, y con criterio de UI/UX.

Soy desarrollador. No quiero código generado en cantidad: quiero decisiones fundamentadas. Explicá brevemente el porqué de cada decisión técnica relevante, respetá la arquitectura y evitá soluciones improvisadas. Es una web corporativa con un CMS simple: **ni sobreingeniería ni atajos inseguros**.

El contexto del negocio, los textos oficiales, la carta, la paleta y lo que está pendiente están en `CLAUDE.md`. Tomalo como fuente de verdad del contenido.

## 1. Repositorio y separación de responsabilidades

```
En-compañia-bar/            ← un solo repositorio Git
├── CLAUDE.md
├── EnCompa-iaFront/        ← Next.js: todo lo visual y de interfaz
└── EnCompa-iaBack/         ← Supabase: base de datos, seguridad, storage
```

- **`EnCompa-iaFront/`**: páginas, componentes, estilos, formularios, lógica de interfaz, Server Actions, configuración de Next.js y tests E2E. Tiene su propio `package.json`.
- **`EnCompa-iaBack/`**: proyecto Supabase (CLI como devDependency local), migraciones SQL, RLS, Storage, funciones SQL, seed, Edge Functions solo si son imprescindibles, y documentación de base de datos y seguridad. Tiene su propio `package.json`, sin dependencias de frontend.
- **Nunca** instales Next.js ni paquetes de frontend en el backend, ni mezcles los proyectos.
- Los **tipos TypeScript** se generan desde el esquema en el backend (`supabase gen types`) y se escriben en `EnCompa-iaFront/src/types/database.types.ts` mediante un script documentado. Es el único punto de contacto entre carpetas.

**Antes de tocar nada:** inspeccioná ambas carpetas. Si están vacías, inicializalas. Si tienen archivos, analizalos y preservalos. No sobrescribas ningún archivo sin revisar su contenido.

## 2. Stack

Usá **versiones estables actuales y compatibles entre sí**. Verificá en la documentación oficial cualquier API o configuración que pueda haber cambiado; no te bases en memoria para cosas como nombres de archivos de configuración o variables de entorno. Antes de instalar cualquier paquete fuera de esta lista, justificalo.

### Frontend — `EnCompa-iaFront/`

| Área        | Tecnología                                            | Notas                                                                                                                                                                                       |
| ----------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework   | Next.js (App Router) + React + TypeScript estricto    | Server Components por defecto; Client Components solo para interacción real.                                                                                                                |
| Estilos     | Tailwind CSS                                          | Tokens de diseño como variables CSS. En Tailwind v4 la configuración es CSS-first (`@theme` en `globals.css`); verificalo en la versión instalada. CSS Modules solo con una razón concreta. |
| Tipografías | `next/font/google`                                    | Cormorant Garamond (títulos) y Montserrat (texto).                                                                                                                                          |
| UI del CMS  | shadcn/ui + Lucide React                              | shadcn solo para el panel admin; la web pública lleva diseño propio.                                                                                                                        |
| Formularios | React Hook Form + Zod                                 | Los mismos schemas Zod validan en cliente y en servidor.                                                                                                                                    |
| Supabase    | `@supabase/supabase-js` + `@supabase/ssr`             | Arquitectura SSR oficial con cookies. **Prohibido** `@supabase/auth-helpers-nextjs`.                                                                                                        |
| Testing     | `@playwright/test`                                    |                                                                                                                                                                                             |
| Calidad     | ESLint + Prettier (con `prettier-plugin-tailwindcss`) |                                                                                                                                                                                             |

`create-next-app` con: TypeScript, ESLint, Tailwind, App Router, directorio `src/`, alias `@/*`. **React Compiler:** evaluá si la versión instalada lo soporta de forma estable y explicame la recomendación antes de activarlo.

### Backend — `EnCompa-iaBack/`

Supabase como backend gestionado: PostgreSQL, Auth, Storage, RLS y Supabase CLI (local, vía `npx supabase`, sin instalación global). Supabase local requiere Docker: verificá si está instalado y, si no, decime qué hace falta.

**No usar:** NestJS, Express, ningún servidor backend propio, Cloudinary, React Query, Redux, ni ORMs. Si en algún momento creés que hace falta alguno, explicame por qué antes.

## 3. Estructura del frontend

Propuesta base (podés mejorarla si lo justificás, manteniendo la organización por funcionalidad). No crees carpetas ni archivos vacíos "por las dudas":

```
EnCompa-iaFront/
├── src/
│   ├── app/
│   │   ├── (public)/              layout público: header, footer, botón "Ver carta" fijo en mobile
│   │   │   ├── page.tsx           /
│   │   │   ├── carta/
│   │   │   ├── nosotros/
│   │   │   ├── capacitaciones/
│   │   │   ├── galeria/
│   │   │   ├── recorrido/
│   │   │   └── contacto/
│   │   ├── admin/
│   │   │   ├── login/             fuera del layout protegido
│   │   │   └── (protected)/       layout que verifica sesión y rol en el servidor
│   │   │       ├── dashboard/
│   │   │       ├── carta/
│   │   │       ├── categorias/
│   │   │       ├── galeria/
│   │   │       ├── recorrido/
│   │   │       ├── capacitaciones/
│   │   │       ├── institucional/
│   │   │       └── configuracion/
│   │   ├── layout.tsx
│   │   └── globals.css            tokens de diseño
│   ├── components/  (ui/ · public/ · admin/ · shared/)
│   ├── features/
│   │   └── <feature>/             products, categories, gallery, tour, trainings, institutional, settings
│   │       ├── queries.ts         lecturas (server-only)
│   │       ├── actions.ts         Server Actions de escritura
│   │       ├── schemas.ts         Zod
│   │       ├── components/
│   │       └── types.ts
│   ├── lib/
│   │   ├── supabase/              client.ts, server.ts, y la lógica del proxy/middleware
│   │   ├── storage/               helpers de upload, rutas y limpieza
│   │   └── utils/
│   └── types/database.types.ts    generado, no editar a mano
├── tests/e2e/
├── .env.example                   (en git)
└── .env.local                     (en .gitignore, nunca en git)
```

Las consultas a Supabase viven solo en `features/*/queries.ts` y `features/*/actions.ts`, nunca dispersas en componentes.

## 4. Backend Supabase

```
EnCompa-iaBack/
├── supabase/
│   ├── config.toml
│   ├── migrations/       <timestamp>_initial_schema.sql, <timestamp>_rls_policies.sql,
│   │                     <timestamp>_storage.sql, <timestamp>_functions.sql
│   └── seed.sql
├── scripts/              gen-types, creación segura del admin (sin secretos en el código)
├── docs/                 DATABASE.md · SECURITY.md · STORAGE.md
├── .env.example
├── package.json          solo supabase CLI como devDependency
└── README.md
```

- Las migraciones se crean con `npx supabase migration new <nombre>` (prefijo timestamp, que es lo que espera la CLI). Son la **única fuente de verdad** del esquema: la base tiene que poder reconstruirse desde cero con `supabase db reset` en local. Nada de cambios manuales desde el Dashboard.
- Todavía puede que no exista el proyecto remoto. Prepará todo en local. Si necesitás project ref, credenciales o Docker, explicame qué configurar. **No inventes credenciales ni vincules un proyecto remoto sin mi autorización.**

## 5. Modelo de datos

Diseñá un esquema normalizado con tipos, restricciones e índices justificados. Todas las tablas con `id uuid default gen_random_uuid()`, `created_at`/`updated_at timestamptz` y un trigger común para `updated_at`. Slugs únicos con formato validado (`CHECK`). Columnas `sort_order integer` donde el admin ordena.

| Tabla           | Campos clave y reglas                                                                                                                                                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `categories`    | `name`, `slug` único, `description` null, `parent_id` null → `categories` (**un solo nivel**: Cafetería → Cafés clásicos), `is_active`, `sort_order`.                                                                                                                                                                                          |
| `products`      | `category_id` → `categories` **ON DELETE RESTRICT** (borrar una categoría con productos debe fallar con un mensaje claro en el CMS, nunca borrar productos en cascada), `name`, `slug` único, `description` **null**, `price numeric(10,2)` **null** con `CHECK (price >= 0)`, `image_path` null, `is_available`, `is_featured`, `sort_order`. |
| `gallery_items` | `media_type` (`image`/`video`), `title`, `description`, `media_path`, `poster_path` (videos), `category` restringida (espacio, café, tapas, cocktails, equipo, momentos), `is_published`, `sort_order`.                                                                                                                                        |
| `tour_images`   | `area` restringida (`salon`, `barra`, `rincones`, `detalles`), `title`, `description`, `image_path`, `is_published`, `sort_order`.                                                                                                                                                                                                             |
| `trainings`     | `title`, `slug`, `description`, `organization`, `instructor`, `certificate_name`, `certificate_image_path`, `cover_image_path`, `is_published`, `sort_order`. Más fotos del equipo: tabla `training_images` (proponé la opción y justificala).                                                                                                 |
| `site_content`  | `section` única (`home_hero`, `offer_coffee`, `offer_tapas`, `offer_cocktails`, `history`, `essence`, `mission`, `vision`, `values`, `differentiation`), `title`, `subtitle`, `content`, `quote`, `image_path`, y para `values` una lista de ítems (título + descripción): `jsonb` validado con Zod o tabla aparte, justificá.                 |
| `site_settings` | **Fila única** (forzada por restricción). Nombre comercial, dirección, teléfono, WhatsApp, Instagram, Facebook, **TikTok**, horarios (estructurados por día si es razonable), `google_maps_embed_url`, `google_maps_directions_url`, `external_menu_url` (opcional), `logo_path`, `hero_media_path`.                                           |
| `profiles`      | `id` → `auth.users` (on delete cascade), `full_name`, `role` restringido (`admin`). Un único administrador inicial.                                                                                                                                                                                                                            |

Usá `CHECK` y enums/constraints para evitar precios negativos, slugs duplicados y valores inválidos. **No agregues tablas que no estén acá sin explicarme antes para qué.**

**Seed (`seed.sql`, solo desarrollo):** la carta completa del `CLAUDE.md` (sección 7) con precios y descripciones en `NULL`, los textos oficiales en `site_content` (sección 5, literales) y las dos capacitaciones. Nada de dirección, teléfonos o redes inventados.

## 6. Seguridad y autenticación (prioritario)

La seguridad se aplica **en la base de datos**, no escondiendo botones.

**Auth:** email + contraseña. Registro público **deshabilitado** en `config.toml` y en el proyecto remoto. Login en `/admin/login`. El primer admin se crea con un procedimiento documentado desde un entorno confiable (Dashboard o script local que lea credenciales de variables de entorno). Nunca contraseñas ni usuarios reales en el repo.

**RLS en todas las tablas expuestas:**

- Público (`anon`): solo `SELECT` de categorías activas, productos disponibles de categorías activas, ítems publicados, contenido institucional y settings. Ninguna escritura.
- Admin: CRUD completo.
- Rol verificado con una función `public.is_admin()` `SECURITY DEFINER`, `STABLE`, con `SET search_path = ''`, que consulta `profiles` sin causar recursión de políticas. Revocá `EXECUTE` a `anon` si no hace falta.
- Escribí tests SQL o un script que demuestre que `anon` no puede escribir y que un usuario autenticado sin rol admin tampoco.

**Next.js:**

- Clientes Supabase según la guía SSR oficial vigente: cliente de navegador, cliente de servidor con cookies, y refresco de sesión en el middleware (en Next.js 16 el archivo se llama `proxy.ts`; verificalo en la versión instalada).
- Para autorizar en el servidor usá `supabase.auth.getClaims()` o `getUser()`, **nunca** `getSession()` como verificación.
- El layout de `admin/(protected)` y **cada Server Action de escritura** verifican sesión y rol. El proxy/middleware solo refresca y redirige: no es la única barrera.

**Secretos:**

- En el cliente solo `NEXT_PUBLIC_SUPABASE_URL` y la clave **publishable** (en proyectos viejos, la `anon`). Verificá los nombres actuales en la documentación.
- La clave **secret** / `service_role` no se usa en el frontend. Si alguna operación la necesita, explicame por qué antes, y que viva solo en código server-only.
- `.env.example` con nombres y valores ilustrativos. `.env.local` y `.env` en `.gitignore`.

## 7. Storage

Bucket **`site-media`**, creado por migración (o `config.toml`, explicá cuál y por qué), de lectura pública, con carpetas `branding/`, `products/`, `gallery/`, `tour/`, `trainings/`, `institutional/`. Escritura, reemplazo y borrado solo para admin vía políticas sobre `storage.objects`.

- Límites de tamaño y tipos MIME permitidos configurados **en el bucket** y validados también en el formulario (imágenes: JPEG, PNG, WebP, AVIF; videos de galería: MP4/WebM con un límite razonable; proponé los valores).
- En la base solo se guarda el **path**, nunca binarios ni URLs armadas a mano. URLs con `getPublicUrl()` del SDK.
- Nombres de archivo únicos y seguros (UUID + extensión validada), sin usar el nombre original.
- **Subida de archivos:** las Server Actions tienen límite de tamaño de body por defecto. Evaluá subir desde el cliente directo a Storage con la sesión del admin (las políticas protegen) y luego guardar el path con una Server Action, o subir el límite. Explicá la elección.
- **Consistencia Storage ↔ PostgreSQL:** al reemplazar, subir el nuevo → actualizar la fila → borrar el anterior. Al eliminar, borrar la fila → borrar el archivo. Si un paso falla, compensar (borrar el archivo recién subido) y mostrar el error. Nada de archivos huérfanos ni filas apuntando a archivos inexistentes.
- `next/image` con `remotePatterns` para el dominio de Supabase, `sizes` correctos, lazy loading y prioridad solo en el hero. Videos con `<video>`, `poster`, `preload="none"` y sin autoplay con sonido.

## 8. Frontend

**Web pública:** Server Components que leen de Supabase a través de `features/*/queries.ts`. Rutas y contenido de cada página según la sección 3 del `CLAUDE.md`. Lightbox accesible para recorrido, galería y certificados (Client Component acotado). Botón "Ver carta" siempre visible en mobile. Si un dato falta (precio, horario, red social), no se muestra el bloque roto: se oculta o se muestra un estado vacío prolijo.

**Diseño:** sistema de tokens con la paleta del `CLAUDE.md` (sección 8), tipografía editorial, mucho aire, fotografía protagonista, animaciones sutiles con CSS y respeto de `prefers-reduced-motion`. Contraste WCAG AA verificado. Nada de plantillas genéricas. La referencia visual definitiva se define más adelante: armá una base sólida y fácil de ajustar.

**SEO:** `metadata` por página, Open Graph, `sitemap.ts`, `robots.ts`, datos estructurados `CafeOrCoffeeShop`/`BarOrPub` (schema.org) solo con datos reales cargados, `lang="es-AR"`.

**CMS (`/admin`):** sidebar, dashboard simple, tablas con orden y filtros básicos, formularios con RHF + Zod, previsualización de imágenes, modales de confirmación para borrar, estados de carga, toasts de éxito y error, responsive. Usable por alguien sin conocimientos técnicos. Edición rápida del "Menú del día" (cambia todos los días).

**Escrituras:** Server Actions por feature. Route Handlers solo si hace falta un endpoint real. Después de cada escritura, revalidá las rutas o tags afectados con la API de caché de la versión instalada de Next.js (verificá `revalidatePath`/`revalidateTag`/`updateTag`).

Flujo de edición de producto: admin edita → RHF + Zod en cliente → Server Action → verifica sesión y rol → Zod en servidor → Supabase aplica RLS → actualiza PostgreSQL y Storage de forma consistente → revalida → la web pública muestra el cambio.

## 9. Testing

Playwright contra **Supabase local** (Docker) con el seed. **Nunca** contra producción.

Cubrir: carga de páginas públicas, navegación, responsive (al menos un viewport mobile y uno desktop), botón "Ver carta" visible en mobile, login, redirección de `/admin/*` sin sesión, acceso denegado a un usuario sin rol admin, CRUD de categorías y productos, bloqueo al borrar una categoría con productos, subida y reemplazo de imagen, cambio de disponibilidad reflejado en la web pública. El usuario admin de prueba se crea en el setup de tests con credenciales de `.env.test.local` (ignorado por git).

## 10. Documentación

- `EnCompa-iaFront/README.md`: instalación, variables de entorno, comandos, ejecución local, testing, integración con Supabase, generación de tipos.
- `EnCompa-iaBack/README.md`: Supabase CLI y Docker, inicialización, migraciones, `db reset`, RLS, Storage, variables, creación del admin, conexión al proyecto remoto (paso a paso, para cuando yo lo autorice).
- `docs/DATABASE.md`, `docs/SECURITY.md`, `docs/STORAGE.md`: decisiones de arquitectura y seguridad, con el porqué.

## 11. Reglas de trabajo

**Siempre:**

- Leé la documentación oficial cuando una API pueda haber cambiado.
- TypeScript estricto, sin `any` salvo justificación puntual.
- Componentes chicos, responsabilidades claras, sin lógica duplicada.
- Accesibilidad (semántica, foco visible, `alt`, teclado en el lightbox) y SEO.
- Si detectás un problema de arquitectura o una contradicción con el `CLAUDE.md`, explicámelo antes de decidir.
- No marques nada como terminado sin haberlo probado.

**Nunca:**

- Instalar paquetes globales ni modificar configuraciones globales de mi máquina.
- Tocar carpetas fuera de este repositorio.
- Borrar archivos existentes sin autorización.
- Exponer o commitear credenciales.
- Inventar configuraciones de Supabase, credenciales o datos del negocio.

**Frená y pedime permiso antes de:**

- Usar credenciales reales.
- Vincular Supabase a un proyecto remoto, modificar una base remota o correr migraciones remotas.
- Crear recursos pagos o publicar el sitio.
- Cualquier operación destructiva.
- Agregar una dependencia o tabla que no esté en este prompt.

Instalar dependencias locales previstas en este prompt dentro de la carpeta que corresponde **no** requiere preguntarme.

## 12. Plan por fases

Trabajá **de a una fase**. No avances a la siguiente sin mi OK.

1. **Auditoría e inicialización:** inspeccionar carpetas; verificar Node, npm, Git y Docker; crear Next.js en Front; dependencias; `supabase init` en Back; estructura base; `.env.example`; `.gitignore`.
2. **Base de datos:** esquema, relaciones, índices, triggers, RLS, `is_admin()`, bucket y políticas de Storage, seed. Verificación con `supabase db reset` y tests de RLS.
3. **Integración:** clientes Supabase SSR, proxy/middleware, auth, protección de `/admin`, tipos generados, primeras queries.
4. **Web pública:** tokens de diseño, tipografías, layouts, navegación, las 7 páginas, imágenes optimizadas, responsive, SEO.
5. **CMS:** login, dashboard, carta, categorías, galería, recorrido, capacitaciones, institucional, configuración.
6. **Seguridad y testing:** revisión de RLS y Storage, Playwright, corrección de errores, `next build` sin errores ni warnings relevantes.
7. **Documentación y publicación:** READMEs y docs, guía para conectar Supabase remoto, variables de producción, preparación del deploy en Vercel (sin publicar sin mi autorización).

**Al cerrar cada fase, reportá:**

- Qué implementaste.
- Archivos creados o modificados.
- Dependencias instaladas (con versión).
- Verificaciones ejecutadas y su resultado.
- Errores encontrados y cómo los resolviste.
- Qué queda pendiente y qué decisiones necesitás de mí.
