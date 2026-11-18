/**
 * "Tragos suizos" → "tragos-suizos". Mismo formato que el dominio `public.slug` de la base:
 * minúsculas, números y guiones simples (`^[a-z0-9]+(-[a-z0-9]+)*$`, máx. 120).
 */
export function slugify(text: string, maxLength = 100): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
  return slug || "item";
}

/** Primer slug libre: "tragos-suizos", "tragos-suizos-2", "tragos-suizos-3"… */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}
