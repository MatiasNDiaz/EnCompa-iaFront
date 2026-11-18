"use server";

import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";

import { removeImages, verifyUploadedImage, verifyUploadedVideo } from "@/features/admin/media/server";
import type { ActionResult } from "@/features/admin/menu/types";
import { requireAdmin } from "@/lib/auth/admin";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ImageChange } from "@/lib/storage/image-rules";
import type { Database } from "@/types/database.types";

import { MEDIA_NEEDED, newsSchema, POSTER_NEEDED, type MediaChange, type NewsFormValues } from "./schemas";

/**
 * Server Actions de Novedades. Igual que el resto del panel: requireAdmin() + el mismo
 * schema que el formulario + CHECK y RLS en la base (migración 24).
 * Archivos: el navegador los sube con una URL firmada; acá se verifican. Si la fila no
 * se guarda, se borran los recién subidos (compensación); si se guarda, se borran los
 * que quedaron sin usar. Después se invalida el tag `news` (lista, detalle y navbar).
 */

type Client = SupabaseClient<Database>;

const SESSION_ERROR = { ok: false, error: "Tu sesión terminó. Volvé a ingresar." } as const;
const NOT_FOUND = { ok: false, error: "No encontramos esa novedad. Recargá la página." } as const;

async function admin() {
  try {
    return (await requireAdmin()).supabase;
  } catch {
    return null;
  }
}

function friendly(error: PostgrestError, fallback: string): string {
  switch (error.code) {
    case "23514":
      return "Algún dato no es válido. Revisá el formulario.";
    case "42501":
      return "No tenés permiso para hacer esto.";
    default:
      console.error("[novedades]", error.code, error.message);
      return fallback;
  }
}

function changed() {
  updateTag(CACHE_TAGS.news);
  refresh();
}

const firstIssue = (error: { issues: { message: string }[] }) =>
  error.issues[0]?.message ?? "Revisá los datos.";

async function freeSlug(supabase: Client, title: string): Promise<string> {
  const base = slugify(title);
  const { data } = await supabase
    .from("news_posts")
    .select("slug")
    .like("slug", `${base}%`);
  return uniqueSlug(base, (data ?? []).map((row) => row.slug));
}

/**
 * Crea (`id` null) o edita una novedad. `publish` es cómo queda: true = se ve en la web.
 * El slug se genera del título al crearla y no cambia después (los links no se rompen).
 */
export async function saveNews(
  id: string | null,
  input: NewsFormValues,
  media: MediaChange,
  poster: ImageChange,
  publish: boolean,
): Promise<ActionResult<{ slug: string }>> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const uploaded = [media.kind === "new" ? media.path : null, poster.kind === "new" ? poster.path : null];
  const fail = async (error: string): Promise<ActionResult<{ slug: string }>> => {
    await removeImages(supabase, uploaded); // compensación: la fila no se guardó
    return { ok: false, error };
  };

  if (id !== null && !z.uuid().safeParse(id).success) return fail(NOT_FOUND.error);
  const parsed = newsSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const data = parsed.data;

  // Archivos recién subidos: ruta del panel, carpeta news/, tipo y tamaño reales.
  if (media.kind === "new") {
    const problem =
      data.mediaType === "video"
        ? await verifyUploadedVideo(supabase, media.path)
        : await verifyUploadedImage(supabase, media.path, "news");
    if (problem) return fail(problem);
  }
  if (poster.kind === "new") {
    const problem = await verifyUploadedImage(supabase, poster.path, "news");
    if (problem) return fail(problem);
  }

  let previous: { media_type: string; media_path: string; poster_path: string | null; slug: string } | null =
    null;
  if (id) {
    const { data: row } = await supabase
      .from("news_posts")
      .select("media_type, media_path, poster_path, slug")
      .eq("id", id)
      .maybeSingle();
    if (!row) return fail(NOT_FOUND.error);
    previous = row;
  }

  // Archivo principal: el nuevo, o el guardado si sigue siendo del mismo tipo.
  const mediaPath =
    media.kind === "new"
      ? media.path
      : previous && previous.media_type === data.mediaType
        ? previous.media_path
        : null;
  if (!mediaPath) return fail(MEDIA_NEEDED);

  const posterPath =
    data.mediaType === "image"
      ? null
      : poster.kind === "new"
        ? poster.path
        : poster.kind === "keep"
          ? (previous?.poster_path ?? null)
          : null;
  if (data.mediaType === "video" && !posterPath) return fail(POSTER_NEEDED);

  const row = {
    title: data.title,
    description: data.description,
    closing_message: data.closingMessage,
    event_date: data.eventDate,
    media_type: data.mediaType,
    media_path: mediaPath,
    poster_path: posterPath,
    is_published: publish,
  };

  let slug = previous?.slug ?? "";
  if (id) {
    const { error } = await supabase.from("news_posts").update(row).eq("id", id).select("id").single();
    if (error) return fail(friendly(error, "No pudimos guardar la novedad. Probá de nuevo."));
  } else {
    // Dos intentos por si otro guardado tomó el mismo slug al mismo tiempo (23505).
    for (let attempt = 0; ; attempt++) {
      slug = await freeSlug(supabase, data.title);
      const { error } = await supabase
        .from("news_posts")
        .insert({ ...row, slug })
        .select("id")
        .single();
      if (!error) break;
      if (error.code !== "23505" || attempt > 0)
        return fail(friendly(error, "No pudimos guardar la novedad. Probá de nuevo."));
    }
  }

  // La fila ya apunta a los archivos nuevos: recién ahora se borran los que quedaron sin uso.
  if (previous) {
    await removeImages(supabase, [
      previous.media_path !== mediaPath ? previous.media_path : null,
      previous.poster_path && previous.poster_path !== posterPath ? previous.poster_path : null,
    ]);
  }

  changed();
  return { ok: true, data: { slug } };
}

/** Publicar u ocultar sin abrir el formulario (menú de cada novedad). */
export async function setNewsPublished(id: string, publish: boolean): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  if (!z.uuid().safeParse(id).success) return NOT_FOUND;

  const { error } = await supabase
    .from("news_posts")
    .update({ is_published: publish })
    .eq("id", id)
    .select("id")
    .single();
  if (error) {
    if (error.code === "PGRST116") return NOT_FOUND;
    return { ok: false, error: friendly(error, "No pudimos cambiar el estado. Probá de nuevo.") };
  }

  changed();
  return { ok: true, data: undefined };
}

/** Elimina la novedad y sus archivos (foto o video y portada). */
export async function deleteNews(id: string): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  if (!z.uuid().safeParse(id).success) return NOT_FOUND;

  const { data: previous } = await supabase
    .from("news_posts")
    .select("media_path, poster_path")
    .eq("id", id)
    .maybeSingle();
  if (!previous) return NOT_FOUND;

  const { error } = await supabase.from("news_posts").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error, "No pudimos eliminarla. Probá de nuevo.") };

  await removeImages(supabase, [previous.media_path, previous.poster_path]);
  changed();
  return { ok: true, data: undefined };
}
