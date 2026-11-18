import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MenuEditorProvider } from "@/features/admin/menu/components/menu-editor";
import { SectionDetail } from "@/features/admin/menu/components/section-detail";
import { getAdminMenu } from "@/features/admin/menu/queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: PageProps<"/admin/carta/[id]">): Promise<Metadata> {
  const { id } = await params;
  if (!UUID.test(id)) return { title: "Carta" };
  const menu = await getAdminMenu();
  return { title: menu.sections.find((s) => s.id === id)?.name ?? "Carta" };
}

export default async function AdminSectionPage({ params }: PageProps<"/admin/carta/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  // Si la sección no existe (p. ej. se acaba de eliminar desde acá) SectionDetail muestra
  // un aviso con link a la carta, en lugar de un 404 en medio de la navegación.
  const menu = await getAdminMenu();

  return (
    <MenuEditorProvider menu={menu}>
      <SectionDetail sectionId={id} />
    </MenuEditorProvider>
  );
}
