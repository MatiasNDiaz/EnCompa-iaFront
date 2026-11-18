import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SpecialsBoard } from "@/features/admin/specials/components/specials-board";
import { getAdminSpecials } from "@/features/admin/specials/queries";

export const metadata: Metadata = { title: "Plato del día" };

export default async function AdminSpecialsPage() {
  const specials = await getAdminSpecials();
  return (
    <>
      <AdminPageHeader
        eyebrow="Plato del día"
        title="Plato del día"
        description="Un plato recomendado para cada momento del día. En la web se ven en la carta, en «Platos del día», y en el menú aparece «Plato del día». Solo se ven los publicados."
      />
      <SpecialsBoard specials={specials} />
    </>
  );
}
