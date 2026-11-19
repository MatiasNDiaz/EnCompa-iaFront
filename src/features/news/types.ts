/** Lo que necesita la web (y la vista previa del panel) para mostrar una novedad. */
export type NewsMedia =
  | { type: "image"; url: string }
  | { type: "video"; url: string; posterUrl: string };

/**
 * Diseño de la tarjeta en /novedades (lo elige el admin). En el celular las tres ponen
 * la foto arriba, cada una con su estilo.
 */
export const NEWS_CARD_LAYOUTS = [
  { value: "split", label: "Dividida", description: "Foto a la izquierda y texto a la derecha." },
  { value: "stacked", label: "Apilada", description: "Foto arriba y texto abajo, con una rama de fondo." },
  { value: "curved", label: "Curva", description: "Foto a la izquierda con el borde curvo." },
] as const;

export type NewsCardLayout = (typeof NEWS_CARD_LAYOUTS)[number]["value"];

export const isCardLayout = (value: string): value is NewsCardLayout =>
  NEWS_CARD_LAYOUTS.some((layout) => layout.value === value);

export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  closingMessage: string | null;
  /** Fecha del evento (YYYY-MM-DD), si tiene. */
  eventDate: string | null;
  publishedAt: string | null;
  media: NewsMedia;
  cardLayout: NewsCardLayout;
};

export const NEWS_LIMITS = {
  title: 120,
  description: 1500,
  closingMessage: 200,
} as const;
