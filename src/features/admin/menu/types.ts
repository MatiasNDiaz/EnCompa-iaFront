import type { Enums } from "@/types/database.types";

export type DayMomentValue = Enums<"day_moment">;

/** Sección (categoría o subcategoría) tal como la ve el panel: incluye las ocultas. */
export type AdminSection = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
  imageUrl: string | null;
  imageIsIllustrative: boolean;
  isActive: boolean;
  /** Momentos propios ([] en una subcategoría = hereda los del padre). */
  moments: DayMomentValue[];
  effectiveMoments: DayMomentValue[];
  sortOrder: number;
};

export type AdminProduct = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  ingredients: string | null;
  price: number | null;
  imagePath: string | null;
  /** Foto propia (Storage) o, si no hay, la ilustrativa/real que muestra hoy la web. */
  thumbUrl: string | null;
  thumbIsIllustrative: boolean;
  isFeatured: boolean;
  isAvailable: boolean;
  /** Fecha `YYYY-MM-DD` en que se marcó sin stock (solo cuenta si es hoy). */
  outOfStockOn: string | null;
  sortOrder: number;
};

export type AdminMenu = {
  sections: AdminSection[];
  products: AdminProduct[];
  /** Hoy en Córdoba (`YYYY-MM-DD`), calculado en el servidor al armar la página. */
  today: string;
};

/** Resultado de toda Server Action del panel. */
export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
