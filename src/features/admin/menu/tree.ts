import type { AdminMenu, AdminProduct, AdminSection } from "./types";

/** Secciones principales en orden, cada una con sus subsecciones. */
export function sectionTree(sections: AdminSection[]) {
  const roots = sections.filter((s) => s.parentId === null);
  return roots.map((root) => ({
    ...root,
    children: sections.filter((s) => s.parentId === root.id),
  }));
}

export type SectionOption = { id: string; label: string; path: string; depth: 0 | 1; isActive: boolean };

/** Lista plana para elegir sección: "Almuerzos", "Almuerzos › Menú del día"… */
export function sectionOptions(sections: AdminSection[]): SectionOption[] {
  return sectionTree(sections).flatMap((root) => [
    { id: root.id, label: root.name, path: root.name, depth: 0 as const, isActive: root.isActive },
    ...root.children.map((child) => ({
      id: child.id,
      label: child.name,
      path: `${root.name} › ${child.name}`,
      depth: 1 as const,
      isActive: child.isActive && root.isActive,
    })),
  ]);
}

export function sectionPath(sections: AdminSection[], id: string) {
  return sectionOptions(sections).find((o) => o.id === id)?.path ?? "";
}

/** Productos de una sección y de sus subsecciones. */
export function productsUnder(menu: Pick<AdminMenu, "sections" | "products">, sectionId: string) {
  const ids = new Set([sectionId, ...menu.sections.filter((s) => s.parentId === sectionId).map((s) => s.id)]);
  return menu.products.filter((p) => ids.has(p.categoryId));
}

export const isOutToday = (product: Pick<AdminProduct, "outOfStockOn">, today: string) =>
  product.outOfStockOn === today;

export const FILTERS = {
  "sin-precio": { label: "Sin precio", test: (p: AdminProduct) => p.price === null },
  "sin-foto": { label: "Sin foto propia", test: (p: AdminProduct) => p.imagePath === null },
  ocultos: { label: "Ocultos", test: (p: AdminProduct) => !p.isAvailable },
  "sin-stock": { label: "Sin stock hoy", test: () => false }, // se resuelve con `today`
} as const;

export type FilterKey = keyof typeof FILTERS;

export const isFilterKey = (value: unknown): value is FilterKey =>
  typeof value === "string" && value in FILTERS;

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/** Búsqueda sin tildes ni mayúsculas en nombre, descripción, ingredientes y sección. */
export function searchProducts(menu: AdminMenu, query: string, filter: FilterKey | null) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const pathById = new Map(sectionOptions(menu.sections).map((o) => [o.id, o.path]));

  return menu.products.filter((product) => {
    if (filter === "sin-stock" ? !isOutToday(product, menu.today) : filter && !FILTERS[filter].test(product)) {
      return false;
    }
    if (terms.length === 0) return true;
    const haystack = normalize(
      [product.name, product.description, product.ingredients, pathById.get(product.categoryId)]
        .filter(Boolean)
        .join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}
