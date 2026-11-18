import type { Metadata } from "next";

import { getAdminMenu } from "@/features/admin/menu/queries";
import { CartaIndex } from "@/features/admin/menu/components/carta-index";
import { MenuEditorProvider } from "@/features/admin/menu/components/menu-editor";

export const metadata: Metadata = { title: "Carta" };

export default async function AdminMenuPage() {
  const menu = await getAdminMenu();
  return (
    <MenuEditorProvider menu={menu}>
      <CartaIndex />
    </MenuEditorProvider>
  );
}
