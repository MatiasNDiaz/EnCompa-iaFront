import "server-only";

import { cache } from "react";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { createPublicClient } from "@/lib/supabase/public";
import { QueryError } from "@/lib/supabase/query-error";
import type { Enums, Tables } from "@/types/database.types";

/**
 * Carta pública: compone `categories` y `products` en un árbol de 2 niveles.
 * (Las features `categories` y `products` del CMS tendrán sus propias queries de admin.)
 */
export type MenuProduct = Pick<
  Tables<"products">,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "ingredients"
  | "price"
  | "image_path"
  | "is_featured"
  | "out_of_stock_on"
>;

export type MenuSubcategory = Pick<
  Tables<"categories">,
  "id" | "name" | "slug" | "description" | "image_path" | "image_is_illustrative"
> & {
  /** Momentos del día en que se sirve (propios o heredados del padre; ver features/menu/moments). */
  effectiveMoments: Enums<"day_moment">[];
  products: MenuProduct[];
};

export type MenuCategory = MenuSubcategory & {
  subcategories: MenuSubcategory[];
};

export const getMenu = cache(async (): Promise<MenuCategory[]> => {
  const client = createPublicClient([CACHE_TAGS.menu]);

  // La RLS ya filtra: solo categorías visibles y productos disponibles de categorías visibles.
  // `categories_with_moments` es una vista security_invoker: misma RLS que `categories`,
  // más `effective_moments` con la herencia padre → subcategoría resuelta en SQL.
  const [categoriesResult, productsResult] = await Promise.all([
    client
      .from("categories_with_moments")
      .select(
        "id, parent_id, name, slug, description, image_path, image_is_illustrative, effective_moments",
      )
      .order("sort_order")
      .order("name"),
    client
      .from("products")
      .select(
        // out_of_stock_on (fecha, no un sí/no): la página decide "Sin stock hoy" con la fecha
        // de Córdoba al mostrarla, así una caché del día anterior no lo deja pegado.
        "id, category_id, name, slug, description, ingredients, price, image_path, is_featured, out_of_stock_on",
      )
      .order("sort_order")
      .order("name"),
  ]);

  if (categoriesResult.error) throw new QueryError("las categorías", categoriesResult.error);
  if (productsResult.error) throw new QueryError("los productos", productsResult.error);

  const productsByCategory = new Map<string, MenuProduct[]>();
  for (const { category_id, ...product } of productsResult.data) {
    const list = productsByCategory.get(category_id) ?? [];
    list.push(product);
    productsByCategory.set(category_id, list);
  }

  const toNode = ({
    id,
    name,
    slug,
    description,
    image_path,
    image_is_illustrative,
    effective_moments,
  }: (typeof categoriesResult.data)[number]) => ({
    id,
    name,
    slug,
    description,
    image_path,
    image_is_illustrative,
    effectiveMoments: effective_moments ?? [],
    products: productsByCategory.get(id) ?? [],
  });

  const roots = categoriesResult.data.filter((c) => c.parent_id === null);
  return roots
    .map((root) => ({
      ...toNode(root),
      subcategories: categoriesResult.data
        .filter((c) => c.parent_id === root.id)
        .map(toNode)
        .filter((sub) => sub.products.length > 0),
    }))
    .filter((category) => category.products.length > 0 || category.subcategories.length > 0);
});
