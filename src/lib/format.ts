const priceFormat = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/** "$8.500" (sin el espacio que agrega Intl para es-AR, como en la referencia). */
export const formatPrice = (value: number) => priceFormat.format(value).replace(/\s/g, "");

/**
 * Precio escrito por una persona → número. Acepta "8500", "8.500", "$ 8.500", "8500,50".
 * En es-AR el punto separa miles y la coma, decimales.
 * Vacío → null (sin precio). Texto inválido → NaN.
 */
export function parsePrice(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") return raw;
  const text = raw.replace(/[$\s]/g, "");
  if (text === "") return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(text)) return Number.NaN;
  return Number(text.replace(/\./g, "").replace(",", "."));
}

/** Número → texto para editar ("8500" o "8500,5"). */
export const priceToInput = (value: number | null) =>
  value === null ? "" : String(value).replace(".", ",");
