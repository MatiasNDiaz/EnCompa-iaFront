import type { DayMoment } from "@/features/menu/moments";

/** Un espacio del plato del día tal como lo ve el panel (publicado o no). */
export type AdminSpecial = {
  moment: DayMoment;
  imagePath: string | null;
  imageUrl: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  price: number | null;
  /** Texto libre; null = no se muestra. */
  ingredients: string | null;
  isPublished: boolean;
  updatedAt: string;
};
