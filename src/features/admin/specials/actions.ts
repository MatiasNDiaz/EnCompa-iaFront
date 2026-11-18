"use server";

import type { PostgrestError } from "@supabase/supabase-js";
import { refresh, updateTag } from "next/cache";

import type { ActionResult } from "@/features/admin/menu/types";
import { removeImages, verifyUploadedImage } from "@/features/admin/media/server";
import type { DayMoment } from "@/features/menu/moments";
import { requireAdmin } from "@/lib/auth/admin";
import { CACHE_TAGS } from "@/lib/cache/tags";
import type { ImageChange } from "@/lib/storage/image-rules";

import { momentSchema, PUBLISH_NEEDS, specialSchema, type SpecialInput } from "./schemas";

/**
 * Server Actions del plato del día. Igual que la carta: requireAdmin() + mismo schema
 * que el formulario + RLS en la base (que además exige foto y título para publicar).
 * Después de escribir se invalida el tag `specials` (home, nav y filtro "Platos del día" de la carta).
 */

const SESSION_ERROR = { ok: false, error: "Tu sesión terminó. Volvé a ingresar." } as const;
const NOT_FOUND = { ok: false, error: "No encontramos ese espacio. Recargá la página." } as const;

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
      // CHECK daily_specials_publishable u otro dato fuera de rango.
      return /publishable/.test(error.message)
        ? PUBLISH_NEEDS
        : "Algún dato no es válido. Revisá el formulario.";
    case "42501":
      return "No tenés permiso para hacer esto.";
    default:
      console.error("[plato del día]", error.code, error.message);
      return fallback;
  }
}

function published() {
  updateTag(CACHE_TAGS.specials);
  refresh();
}

const firstIssue = (error: { issues: { message: string }[] }) =>
  error.issues[0]?.message ?? "Revisá los datos.";

/**
 * Guarda un espacio. `publish` es cómo queda: true = se ve en la web, false = no.
 * Una foto nueva ya está en Storage (subida firmada); si algo falla se borra.
 */
export async function saveSpecial(
  moment: DayMoment,
  input: SpecialInput,
  image: ImageChange,
  publish: boolean,
): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;

  const newPath = image.kind === "new" ? image.path : null;
  const fail = async (error: string): Promise<ActionResult> => {
    await removeImages(supabase, [newPath]); // compensación: la fila no se guardó
    return { ok: false, error };
  };

  const parsedMoment = momentSchema.safeParse(moment);
  if (!parsedMoment.success) return fail("Momento no válido.");
  const parsed = specialSchema.safeParse(input);
  if (!parsed.success) return fail(firstIssue(parsed.error));
  const data = parsed.data;

  if (newPath) {
    const problem = await verifyUploadedImage(supabase, newPath, "specials");
    if (problem) return { ok: false, error: problem }; // verifyUploadedImage ya la borró
  }

  const { data: previous } = await supabase
    .from("daily_specials")
    .select("image_path")
    .eq("moment", parsedMoment.data)
    .maybeSingle();
  if (!previous) return fail(NOT_FOUND.error);

  const imagePath =
    image.kind === "keep" ? previous.image_path : image.kind === "remove" ? null : image.path;
  if (publish && (!imagePath || !data.title)) return fail(PUBLISH_NEEDS);

  const { error } = await supabase
    .from("daily_specials")
    .update({
      title: data.title,
      subtitle: data.subtitle,
      body: data.body,
      price: data.price,
      ingredients: data.ingredients,
      image_path: imagePath,
      is_published: publish,
    })
    .eq("moment", parsedMoment.data)
    .select("moment")
    .single();
  if (error) return fail(friendly(error, "No pudimos guardar el plato. Probá de nuevo."));

  // La fila ya apunta a la foto nueva (o a ninguna): recién ahora se borra la anterior.
  if (previous.image_path && previous.image_path !== imagePath) {
    await removeImages(supabase, [previous.image_path]);
  }

  published();
  return { ok: true, data: undefined };
}

/** Publicar o quitar de la web sin abrir el formulario (botones de cada tarjeta). */
export async function setSpecialPublished(
  moment: DayMoment,
  publish: boolean,
): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  const parsedMoment = momentSchema.safeParse(moment);
  if (!parsedMoment.success) return { ok: false, error: "Momento no válido." };

  if (publish) {
    const { data } = await supabase
      .from("daily_specials")
      .select("image_path, title")
      .eq("moment", parsedMoment.data)
      .maybeSingle();
    if (!data) return NOT_FOUND;
    if (!data.image_path || !data.title) return { ok: false, error: PUBLISH_NEEDS };
  }

  const { error } = await supabase
    .from("daily_specials")
    .update({ is_published: publish })
    .eq("moment", parsedMoment.data)
    .select("moment")
    .single();
  if (error)
    return { ok: false, error: friendly(error, "No pudimos cambiar el estado. Probá de nuevo.") };

  published();
  return { ok: true, data: undefined };
}

/** Vaciar el espacio: borra los datos y la foto, y lo saca de la web. La fila queda. */
export async function clearSpecial(moment: DayMoment): Promise<ActionResult> {
  const supabase = await admin();
  if (!supabase) return SESSION_ERROR;
  const parsedMoment = momentSchema.safeParse(moment);
  if (!parsedMoment.success) return { ok: false, error: "Momento no válido." };

  const { data: previous } = await supabase
    .from("daily_specials")
    .select("image_path")
    .eq("moment", parsedMoment.data)
    .maybeSingle();
  if (!previous) return NOT_FOUND;

  const { error } = await supabase
    .from("daily_specials")
    .update({
      is_published: false,
      image_path: null,
      title: null,
      subtitle: null,
      body: null,
      price: null,
      ingredients: null,
    })
    .eq("moment", parsedMoment.data)
    .select("moment")
    .single();
  if (error)
    return { ok: false, error: friendly(error, "No pudimos vaciar el espacio. Probá de nuevo.") };

  await removeImages(supabase, [previous.image_path]);
  published();
  return { ok: true, data: undefined };
}
