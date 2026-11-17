# Prompt 3 — Respuesta a las dudas antes de la Fase 2

Decisiones tomadas antes de la Fase 2 (base de datos). Prevalecen sobre el Prompt 2.

## 1. Criterios confirmados

- **Carta: DECIDIDO, va interna.** Es una página de la web, `/carta`, pública (sin login) y administrada desde el CMS. No hay carta externa: se saca `external_menu_url` de `site_settings`. Todos los botones "Ver carta" / "Descubrí nuestra carta" llevan a `/carta`, en la misma pestaña.
- **Descriptor:** el del logo ("Café · Tapeo · Vermú") va solo dentro del logo; en la web se usa "Café · Tapas · Cocktails".
- **Galería:** `gallery_items` con `media_type` y `poster_path`.
- **Fechas de capacitaciones:** no se cargan.
- **Vinos:** no se agregan hasta que llegue la carta.
- **Menú del día:** subcategoría "Menú del día" dentro de "Almuerzos", con 2 productos editables rápido desde el CMS, sin tabla nueva.

## 2. Capacitaciones: qué está confirmado y qué no

Los nombres de instructores (Belén Carabajal, Charly Artale) aparecen solo en la presentación interna al equipo: **no se publican** hasta confirmarlos.

| Campo              | Café                                       | Coctelería                                    |
| ------------------ | ------------------------------------------ | --------------------------------------------- |
| `organization`     | Doppio Project                             | NULL (el texto oficial no nombra institución) |
| `certificate_name` | CSP Barista Skills – Foundation (SCA)      | NULL. No se publica como certificación        |
| `instructor`       | NULL hasta confirmar                       | NULL hasta confirmar                          |
| `description`      | Texto oficial 5.7 del `CLAUDE.md`, literal | Texto oficial 5.8 del `CLAUDE.md`, literal    |

Todo lo que no esté en los textos oficiales queda en NULL hasta tener los diplomas. El CMS debe permitir completarlo después.

## 3. Propuestas de la Fase 2 aprobadas (con ajustes)

- **`training_images` como tabla**, con `ON DELETE CASCADE` desde `trainings`. El cascade borra filas, no archivos: la Server Action que elimina una capacitación debe borrar también de Storage sus fotos, portada y certificado.
- **`site_content.items` como `jsonb`**: el CHECK exige `jsonb_typeof(items) = 'array'` y que solo se use en las secciones que lo necesitan (por ahora `values`); NULL en las demás.
- **Horarios como `jsonb` por día**: NULL en el seed; la web oculta el bloque.
- **Bucket `site-media` por migración.**
- **Límites:** 50 MiB en el bucket, 8 MiB para imágenes en el formulario. Además:
  - Validar tipo MIME y tamaño también **en el servidor** antes de guardar el path.
  - Documentar en `STORAGE.md` que el proyecto remoto tiene su propio límite global de subida (depende del plan, se configura en el Dashboard) y revisarlo al vincular.
- **`file_size_limit = 50MiB` en `config.toml`** (solo entorno local).

## 4. Versionado

`CLAUDE.md` y los prompts se copian a `EnCompa-iaFront/docs/`. El original queda en la raíz con una nota de sincronización. No se duplican en el backend (el backend solo necesita el seed, que ya va versionado).

## 5. Fase 2

OK para la Fase 2 con los ajustes anteriores. Recordatorios:

- Seed: carta completa con `price` y `description` en NULL, textos oficiales literales en `site_content` y las dos capacitaciones según la tabla de la sección 2.
- Ningún dato de contacto, horario ni red social.
- Todo reconstruible con `supabase db reset` en local.
- Tests de RLS que demuestren que ni `anon` ni un usuario autenticado sin rol admin pueden escribir, ni en tablas ni en Storage.
- Nada remoto sin autorización.
