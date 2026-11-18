/** Lo que necesita la web (y la vista previa del panel) para mostrar una novedad. */
export type NewsMedia =
  | { type: "image"; url: string }
  | { type: "video"; url: string; posterUrl: string };

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
};

export const NEWS_LIMITS = {
  title: 120,
  description: 1500,
  closingMessage: 200,
} as const;
