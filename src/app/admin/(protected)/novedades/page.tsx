import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NewsBoard } from "@/features/admin/news/components/news-board";
import { getAdminNews } from "@/features/admin/news/queries";

export const metadata: Metadata = { title: "Novedades" };

export default async function AdminNewsPage() {
  const posts = await getAdminNews();
  return (
    <>
      <AdminPageHeader
        eyebrow="Novedades"
        title="Novedades"
        description="Eventos, promociones y propuestas especiales. Se ven en «Novedades», en el menú de la web, de la más reciente a la más vieja. Solo se ven las publicadas."
      />
      <NewsBoard posts={posts} />
    </>
  );
}
