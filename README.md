# En Compañía — Frontend (Next.js)

Web pública y panel administrativo (CMS) de **En Compañía**, La Cumbre, Córdoba.

> Estado: **Fase 4** completa (web pública). CMS: Fase 5.
>
> Diseño: ver [docs/DESIGN.md](docs/DESIGN.md) (tokens, contraste, tipografía, movimiento,
> imágenes y logos). Contenido del negocio: [docs/CLAUDE.md](docs/CLAUDE.md).

## Estructura

```text
src/
├── app/
│   ├── (public)/          web pública: layout (header, footer, "Ver carta" mobile) + 7 páginas
│   ├── admin/             login + (protected)/ con verificación de sesión y rol
│   ├── icon.svg · apple-icon.png · opengraph-image.jpg · sitemap.ts · robots.ts
│   └── globals.css        sistema de diseño (tokens, tipografía, reveal)
├── assets/brand/          8 imágenes del manual (importación estática, no públicas)
├── components/
│   ├── motion/            Reveal + RevealObserver (un único IntersectionObserver)
│   ├── public/            header, footer, menú mobile, secciones de la home
│   ├── shared/            logos, íconos, MediaImage, placeholder, lightbox, botones
│   └── ui/                shadcn (panel)
├── config/                site.ts (marca, navegación) · motion.ts (tiempos de animación)
├── features/<feature>/    queries.ts (server-only) · schemas.ts · components/
└── lib/                   supabase/ (clientes + proxy) · auth/ · storage/ · cache/
public/brand/              SVG oficiales (logos + icons/)
```

## Stack

| Área         | Tecnología                                               |
| ------------ | -------------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack), React 19, TypeScript |
| Compilador   | React Compiler (memoización automática)                  |
| Estilos      | Tailwind CSS 4 + variables CSS                           |
| UI del CMS   | shadcn/ui (preset `base-nova`, Base UI) + Lucide         |
| Formularios  | React Hook Form + Zod                                    |
| Datos / Auth | `@supabase/supabase-js` + `@supabase/ssr`                |
| Testing E2E  | Playwright (`@playwright/test`)                          |
| Calidad      | ESLint + Prettier (con orden de clases Tailwind)         |

El backend (esquema, RLS, Storage) vive en el repo hermano **`EnCompa-iaBack`**.

## Requisitos

- Node.js ≥ 20 (probado con 26) y npm.
- Supabase local corriendo desde `EnCompa-iaBack` (`npm run db:start`), o un proyecto remoto.

## Instalación

```bash
npm install
cp .env.example .env.local     # completar con los valores de `npx supabase status`
npx playwright install chromium   # solo la primera vez, para los tests E2E
npm run dev                     # http://localhost:3000
```

## Variables de entorno

| Variable                               | Pública | Descripción                           |
| -------------------------------------- | ------- | ------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Sí      | URL del proyecto Supabase             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Sí      | Clave publishable (protegida por RLS) |
| `NEXT_PUBLIC_SITE_URL`                 | Sí      | URL pública del sitio                 |

La **service role / secret key no se usa en el frontend**. Ver `.env.example`.

## Comandos

| Comando               | Descripción                                    |
| --------------------- | ---------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo                         |
| `npm run build`       | Build de producción                            |
| `npm run start`       | Sirve el build de producción                   |
| `npm run lint`        | ESLint                                         |
| `npm run typecheck`   | Genera tipos de rutas (`next typegen`) + `tsc` |
| `npm run format`      | Formatea con Prettier                          |
| `npm run test:e2e`    | Tests Playwright (desktop + mobile)            |
| `npm run test:e2e:ui` | Tests Playwright en modo interactivo           |

## Integración con Supabase

| Archivo                                      | Uso                                                                              |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/lib/supabase/client.ts`                 | Cliente de **navegador** (Client Components; subida directa a Storage en el CMS) |
| `src/lib/supabase/server.ts`                 | Cliente de **servidor con cookies** (`server-only`): `/admin`, Server Actions    |
| `src/lib/supabase/public.ts`                 | Cliente de **servidor sin cookies** (`server-only`) para la web pública          |
| `src/lib/supabase/proxy.ts` + `src/proxy.ts` | Refresco de sesión y redirección optimista de `/admin/*`                         |
| `src/lib/auth/admin.ts`                      | `getAdminStatus()` y `requireAdmin()`: sesión (`getClaims()`) + rol (`profiles`) |
| `src/lib/storage/media.ts`                   | `getMediaUrl(path)`: URL pública con `getPublicUrl()`, tolera `null`             |
| `src/features/*/queries.ts`                  | Lecturas públicas por feature (`server-only`)                                    |

### Decisiones

- **Web pública sin cookies → páginas estáticas.** El contenido público es igual para todos
  (rol `anon`). `createPublicClient(tags)` usa la clave publishable sin sesión y etiqueta cada
  `fetch` con `next: { tags }` + `cache: "force-cache"`. Así las páginas se prerenderizan.
- **Caché por tags** (`src/lib/cache/tags.ts`: `settings`, `institutional`, `menu`, `tour`,
  `gallery`, `trainings`). Sin Cache Components, la API vigente es `fetch` con tags +
  `updateTag(tag)` desde las Server Actions del CMS (Fase 5): invalida solo lo afectado y el
  admin ve su cambio en la carga siguiente (_read-your-own-writes_).
- **Proxy solo en `/admin/:path*`.** La web pública no usa sesión: no paga la latencia del
  refresco. El proxy **no es la barrera de seguridad**: el layout `admin/(protected)` y cada Server
  Action (`requireAdmin()`) verifican en el servidor, y la RLS vuelve a verificar en la base.
- **Rol admin desde `profiles`.** `private.is_admin()` no se expone por la API; la RLS permite a
  cada usuario leer solo su perfil y nadie puede escribir `profiles` desde la API, así que el
  rol no se puede falsificar. Sesión verificada con `getClaims()` (nunca `getSession()`).
- **Imágenes de Supabase local:** Next 16 bloquea optimizar imágenes de IPs locales;
  `dangerouslyAllowLocalIP` se activa **solo** si `NEXT_PUBLIC_SUPABASE_URL` es local.

### Administrador

Se crea desde el backend: `npm run admin:create` en `EnCompa-iaBack` (ver su README). Login en
`/admin/login`. Mensajes de error genéricos (no revelan si el email existe).

## Testing

Los tests están en `tests/e2e/` y corren en dos perfiles: `desktop` (Chrome) y `mobile` (Pixel 7).
Playwright levanta `npm run dev` automáticamente si no hay un servidor corriendo.

Requisitos: Supabase local corriendo y `.env.test.local` (copiar `.env.test.example`). El setup
global crea un usuario admin y uno sin rol, y el teardown los borra. **Aborta si Supabase no es
local**: nunca correr los tests contra producción.

## Notas

- `AGENTS.md` lo genera y mantiene Next.js para orientar a asistentes de código; no editar a mano.
