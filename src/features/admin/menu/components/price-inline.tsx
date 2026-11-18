"use client";

import { useState } from "react";

import { toast } from "@/components/ui/toaster";
import { formatPrice, parsePrice, priceToInput } from "@/lib/format";
import { cn } from "@/lib/utils";

import { updateProductPrice } from "../actions";

/**
 * Edición rápida del precio desde la lista: se guarda al salir del campo o con Enter;
 * Esc vuelve al valor anterior.
 */
export function PriceInline({
  productId,
  productName,
  price,
}: {
  productId: string;
  productName: string;
  price: number | null;
}) {
  const [draft, setDraft] = useState(priceToInput(price));
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(price);

  // Si el precio cambia desde otro lado (p. ej. el formulario), mostrar el nuevo.
  if (price !== lastSaved && !saving) {
    setLastSaved(price);
    setDraft(priceToInput(price));
  }

  const commit = async () => {
    const next = parsePrice(draft);
    if (next === lastSaved || (Number.isNaN(next) && draft.trim() === "")) return;
    setSaving(true);
    const result = await updateProductPrice(productId, draft);
    setSaving(false);
    if (!result.ok) {
      toast.error("No se guardó el precio", result.error);
      setDraft(priceToInput(lastSaved));
      return;
    }
    setLastSaved(result.data.price);
    setDraft(priceToInput(result.data.price));
    toast.success(
      "Precio actualizado",
      result.data.price === null
        ? `«${productName}» quedó sin precio.`
        : `«${productName}» ahora cuesta ${formatPrice(result.data.price)}.`,
    );
  };

  return (
    <label className="relative flex shrink-0 items-center">
      <span className="sr-only">Precio de {productName}</span>
      <span aria-hidden className="pointer-events-none absolute left-3 text-sm text-muted-foreground">
        $
      </span>
      <input
        value={draft}
        inputMode="decimal"
        autoComplete="off"
        placeholder="Sin precio"
        disabled={saving}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setDraft(priceToInput(lastSaved));
            requestAnimationFrame(() => event.currentTarget?.blur());
          }
        }}
        className={cn(
          "h-11 w-28 rounded-xl border border-transparent bg-secondary/70 pr-3 pl-6 text-right font-serif text-lg font-semibold tabular-nums transition-colors outline-none placeholder:font-sans placeholder:text-xs placeholder:font-normal placeholder:text-muted-foreground hover:border-caramel/50 focus-visible:border-olive focus-visible:bg-background focus-visible:ring-3 focus-visible:ring-ring/40",
          saving && "opacity-60",
        )}
      />
    </label>
  );
}
