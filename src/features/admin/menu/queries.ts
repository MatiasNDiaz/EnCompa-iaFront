import "server-only";

import { cache } from "react";

import { LOCAL_PRODUCT_PHOTOS } from "@/assets/local";
import { MENU_PRODUCT_IMAGES } from "@/assets/menu/products";
import { requireAdmin } from "@/lib/auth/admin";
import { getMediaUrl } from "@/lib/storage/media";
import { QueryError } from "@/lib/supabase/query-error";
import { barToday } from "@/lib/time";

import type { AdminMenu, AdminProduct, AdminSection } from "./types";

/**
 * Carta completa para el panel, con la sesión del admin: la RLS le deja ver también
 * secciones y productos ocultos. Sin caché (siempre el estado real).
 */
export const getAdminMenu = cache(async (): Promise<AdminMenu> => {
  const { supabase } = await requireAdmin();

  const [sectionsResult, productsResult] = await Promise.all([
    supabase
      .from("categories_with_moments")
      .select(
        "id, parent_id, name, slug, description, image_path, image_is_illustrative, is_active, moments, effective_moments, sort_order",
      )
      .order("sort_order")
      .order("name"),
    supabase
      .from("products")
      .select(
        "id, category_id, name, slug, description, ingredients, price, image_path, is_featured, is_available, out_of_stock_on, sort_order",
      )
      .order("sort_order")
      .order("name"),
  ]);

  if (sectionsResult.error) throw new QueryError("las secciones", sectionsResult.error);
  if (productsResult.error) throw new QueryError("los productos", productsResult.error);

  const sections: AdminSection[] = sectionsResult.data.map((s) => ({
    id: s.id,
    parentId: s.parent_id,
    name: s.name,
    slug: s.slug,
    description: s.description,
    imagePath: s.image_path,
    imageUrl: getMediaUrl(s.image_path),
    imageIsIllustrative: s.image_is_illustrative,
    isActive: s.is_active,
    moments: s.moments,
    effectiveMoments: s.effective_moments ?? [],
    sortOrder: s.sort_order,
  }));

  const products: AdminProduct[] = productsResult.data.map((p) => {
    const own = getMediaUrl(p.image_path);
    const fallback = LOCAL_PRODUCT_PHOTOS[p.slug] ?? MENU_PRODUCT_IMAGES[p.slug];
    return {
      id: p.id,
      categoryId: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      ingredients: p.ingredients,
      price: p.price,
      imagePath: p.image_path,
      thumbUrl: own ?? fallback?.src ?? null,
      thumbIsIllustrative: !own && !LOCAL_PRODUCT_PHOTOS[p.slug] && Boolean(fallback),
      isFeatured: p.is_featured,
      isAvailable: p.is_available,
      outOfStockOn: p.out_of_stock_on,
      sortOrder: p.sort_order,
    };
  });

  return { sections, products, today: barToday() };
});
