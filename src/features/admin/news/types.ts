export type AdminNewsPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  closingMessage: string | null;
  eventDate: string | null;
  mediaType: "image" | "video";
  mediaPath: string;
  mediaUrl: string | null;
  posterPath: string | null;
  posterUrl: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
};
