import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { QueryError } from "@/lib/supabase/query-error";
import { barToday } from "@/lib/time";

export type MenuHealth = {
  products: number;
  withoutPrice: number;
  /** Sin foto propia (en la web muestran una imagen ilustrativa o nada). */
  withoutPhoto: number;
  hidden: number;
  /** Marcados "Sin stock hoy" (fecha de hoy en Córdoba). */
  outToday: number;
};

/**
 * Resumen de la carta para el Inicio del panel. Con la sesión del admin (la RLS le deja
 * ver también los productos ocultos). Sin caché: siempre el estado real.
 */
export async function getMenuHealth(): Promise<MenuHealth> {
  const { supabase } = await requireAdmin();
  const count = () => supabase.from("products").select("id", { count: "exact", head: true });

  const [all, withoutPrice, withoutPhoto, hidden, outToday] = await Promise.all([
    count(),
    count().is("price", null),
    count().is("image_path", null),
    count().eq("is_available", false),
    count().eq("out_of_stock_on", barToday()),
  ]);

  for (const result of [all, withoutPrice, withoutPhoto, hidden, outToday]) {
    if (result.error) throw new QueryError("el resumen de la carta", result.error);
  }

  return {
    products: all.count ?? 0,
    withoutPrice: withoutPrice.count ?? 0,
    withoutPhoto: withoutPhoto.count ?? 0,
    hidden: hidden.count ?? 0,
    outToday: outToday.count ?? 0,
  };
}
