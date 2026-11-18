"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh, updateTag } from "next/cache";

import { removeImages, verifyUploadedImage } from "@/features/admin/media/server";
import { requireAdmin } from "@/lib/auth/admin";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { slugify, uniqueSlug } from "@/lib/slug";
import type { ImageChange } from "@/lib/storage/image-rules";
import { barToday } from "@/lib/time";

import { priceField, productSchema, sectionSchema, type ProductInput, type SectionInput } from "./schemas";
import type { ActionResult } from "./types";

/**
 * Server Actions de la carta. Cada una:
 *   1. verifica sesión y rol con requireAdmin() (la RLS vuelve a verificar en la base);
 *   2. valida con el mismo schema que el formulario;
 *   3. después de escribir invalida el tag `menu` (la web pública se actualiza) y
 *      refresca la vista del admin.
 * Mostrar u ocultar botones en la UI no es seguridad: la barrera real es esto + la RLS.
 */

const SESSION_ERROR = { ok: false, error: "Tu sesión terminó. Volvé a ingresar." } as const;
const HAS_CHILDREN = "Esta sección tiene productos o subsecciones. Movelos o eliminalos primero.";

async function admin() {
  try {
    return (await requireAdmin()).supabase;
  } catch {
    return null;
  }
}

type Supabase = NonNullable<Awaited<ReturnType<typeof admin>>>;

function friendly(error: PostgrestError, fallback: string): string {
  switch (error.code) {
    case "23503":
      return HAS_CHILDREN;
    case "23505":
      return "Ya existe algo con ese nombre. Probá con otro.";
    case "23514":
      return "Algún dato no es válido. Revisá el formulario.";
    case "42501":
      return "No tenés permiso para hacer esto.";
    default:
      console.error("[carta]", error.code, error.message);
      return fallback;
  }
}

function published() {
  updateTag(CACHE_TAGS.menu);
  refresh();
}

const firstIssue = (error: { issues: { message: string }[] }) =>
  error.issues[0]?.message ?? "Revisá los datos.";

async function freeSlug(supabase: Supabase, table: "categories" | "products", name: string) {
  const base = slugify(name);
  const { data } = await supabase.from(table).select("slug").like("slug", `${base}%`);
  return uniqueSlug(base, (data ?? []).map((row) => row.slug));
}

/** Al final de sus hermanas (sección raíz si parentId es null). */
async function nextSectionOrder(supabase: Supabase, parentId: string | null) {
  const base = supabase.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const { data } = await (parentId === null ? base.is("parent_id", null) : base.eq("parent_id", parentId));
  return (data?.[0]?.sort_order ?? -1) + 1;
}

/** Al final de la sección. */
async function nextProductOrder(supabase: Supabase, categoryId: string) {
  const { data } = await supabase
    .from("products")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1);
  return (data?.[0]?.sort_order ?? -1) + 1;
}

/** Valida la foto nueva (si hay) y devuelve qué escribir en la columna. */
async function resolveImage(
  supabase: Supabase,
  image: ImageChange,
  folder: "products" | "categories",
): Promise<{ error: string } | { value: string | null | undefined }> {
  if (image.kind === "keep") return { value: undefined };
  if (image.kind === "remove") return { value: null };
  const problem = await verifyUploadedImage(supabase, image.path, folder);
  return problem ? { error: problem } : { value: image.path };
}

// =============================================================================
// Secciones
// =============================================================================

export async function saveSection(
  id: string | null,
  input: SectionInput,
  image: ImageChange,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const parsed = sectionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const data = parsed.data;
  if (id && data.parentId === id) return { ok: false, error: "Una sección no puede estar dentro de sí misma." };

  const resolved = await resolveImage(supabase, image, "categories");
  if ("error" in resolved) return { ok: false, error: resolved.error };
  const newPath = image.kind === "new" ? image.path : null;

  const previous = id
    ? (await supabase.from("categories").select("image_path").eq("id", id).maybeSingle()).data
    : null;
  if (id && !previous) {
    await removeImages(supabase, [newPath]);
    return { ok: false, error: "No encontramos esa sección. Recargá la página." };
  }

  const fields = {
    name: data.name,
    description: data.description,
    moments: data.moments,
    parent_id: data.parentId,
    is_active: data.isActive,
    // Foto nueva o quitada: ya no es una foto de banco.
    ...(resolved.value !== undefined && { image_path: resolved.value, image_is_illustrative: false }),
  };

  const result = id
    ? await supabase.from("categories").update(fields).eq("id", id).select("id, slug").single()
    : await supabase
        .from("categories")
        .insert({
          ...fields,
          slug: await freeSlug(supabase, "categories", data.name),
          sort_order: await nextSectionOrder(supabase, data.parentId),
        })
        .select("id, slug")
        .single();

  if (result.error) {
    await removeImages(supabase, [newPath]); // compensación: la fila no se guardó
    // Trigger private.enforce_category_depth: la carta tiene un solo nivel de subsecciones.
    if (result.error.code === "23514" && /subcategor/i.test(result.error.message)) {
      return {
        ok: false,
        error:
          "La carta tiene un solo nivel: una subsección va dentro de una sección principal, y una sección con subsecciones no puede pasar a ser subsección.",
      };
    }
    return { ok: false, error: friendly(result.error, "No pudimos guardar la sección. Probá de nuevo.") };
  }

  if (resolved.value !== undefined && previous?.image_path && previous.image_path !== resolved.value) {
    await removeImages(supabase, [previous.image_path]);
  }

  published();
  return { ok: true, data: result.data };
}

export async function deleteSection(id: string): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const [section, children, products] = await Promise.all([
    supabase.from("categories").select("image_path").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id", { count: "exact", head: true }).eq("parent_id", id),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id),
  ]);
  if (!section.data) return { ok: false, error: "No encontramos esa sección. Recargá la página." };
  if ((children.count ?? 0) > 0 || (products.count ?? 0) > 0) return { ok: false, error: HAS_CHILDREN };

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: friendly(error, "No pudimos eliminar la sección.") };

  await removeImages(supabase, [section.data.image_path]);
  published();
  return { ok: true, data: undefined };
}

export async function setSectionVisibility(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return { ok: false, error: friendly(error, "No pudimos cambiar la visibilidad.") };
  published();
  return { ok: true, data: undefined };
}

export async function reorderSections(ids: string[]): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  const { error } = await supabase.rpc("reorder_categories", { ids });
  if (error) return { ok: false, error: friendly(error, "No pudimos guardar el orden.") };
  published();
  return { ok: true, data: undefined };
}

// =============================================================================
// Productos
// =============================================================================

export async function saveProduct(
  id: string | null,
  input: ProductInput,
  image: ImageChange,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };
  const data = parsed.data;

  const resolved = await resolveImage(supabase, image, "products");
  if ("error" in resolved) return { ok: false, error: resolved.error };
  const newPath = image.kind === "new" ? image.path : null;

  const previous = id
    ? (await supabase.from("products").select("image_path, category_id").eq("id", id).maybeSingle()).data
    : null;
  if (id && !previous) {
    await removeImages(supabase, [newPath]);
    return { ok: false, error: "No encontramos ese producto. Recargá la página." };
  }

  const fields = {
    category_id: data.categoryId,
    name: data.name,
    description: data.description,
    ingredients: data.ingredients,
    price: data.price,
    is_featured: data.isFeatured,
    is_available: data.isAvailable,
    ...(resolved.value !== undefined && { image_path: resolved.value }),
  };

  const movedTo = previous && previous.category_id !== data.categoryId ? data.categoryId : null;
  const result = id
    ? await supabase
        .from("products")
        .update({
          ...fields,
          ...(movedTo && {
            sort_order: await nextProductOrder(supabase, movedTo),
          }),
        })
        .eq("id", id)
        .select("id")
        .single()
    : await supabase
        .from("products")
        .insert({
          ...fields,
          slug: await freeSlug(supabase, "products", data.name),
          sort_order: await nextProductOrder(supabase, data.categoryId),
        })
        .select("id")
        .single();

  if (result.error) {
    await removeImages(supabase, [newPath]);
    return { ok: false, error: friendly(result.error, "No pudimos guardar el producto. Probá de nuevo.") };
  }

  if (resolved.value !== undefined && previous?.image_path && previous.image_path !== resolved.value) {
    await removeImages(supabase, [previous.image_path]);
  }

  published();
  return { ok: true, data: result.data };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const { data, error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .select("image_path")
    .maybeSingle();
  if (error) return { ok: false, error: friendly(error, "No pudimos eliminar el producto.") };
  if (!data) return { ok: false, error: "No encontramos ese producto. Recargá la página." };

  // Primero la fila (lo importante), después la foto.
  await removeImages(supabase, [data.image_path]);
  published();
  return { ok: true, data: undefined };
}

export async function moveProduct(id: string, categoryId: string): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const { error } = await supabase
    .from("products")
    .update({
      category_id: categoryId,
      sort_order: await nextProductOrder(supabase, categoryId),
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return { ok: false, error: friendly(error, "No pudimos cambiar el producto de sección.") };
  published();
  return { ok: true, data: undefined };
}

/** "Sin stock por hoy" (fecha de hoy en Córdoba) o "Disponible otra vez" (NULL). */
export async function setProductStock(id: string, outToday: boolean): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const { error } = await supabase
    .from("products")
    .update({ out_of_stock_on: outToday ? barToday() : null })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return { ok: false, error: friendly(error, "No pudimos cambiar el stock.") };
  published();
  return { ok: true, data: undefined };
}

export async function setProductVisibility(id: string, isAvailable: boolean): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const { error } = await supabase
    .from("products")
    .update({ is_available: isAvailable })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return { ok: false, error: friendly(error, "No pudimos cambiar la visibilidad.") };
  published();
  return { ok: true, data: undefined };
}

export async function updateProductPrice(
  id: string,
  rawPrice: string,
): Promise<ActionResult<{ price: number | null }>> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const parsed = priceField.safeParse(rawPrice);
  if (!parsed.success) return { ok: false, error: firstIssue(parsed.error) };

  const { error } = await supabase
    .from("products")
    .update({ price: parsed.data })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return { ok: false, error: friendly(error, "No pudimos guardar el precio.") };
  published();
  return { ok: true, data: { price: parsed.data } };
}
