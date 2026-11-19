import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ManualView } from "@/features/help/components/manual-view";
import { getManual } from "@/features/help/manual";

export const metadata: Metadata = { title: "Ayuda" };

/** El manual del panel (docs/MANUAL-PANEL.md), dentro del panel. */
export default function AdminHelpPage() {
  const manual = getManual();
  return (
    <>
      <AdminPageHeader eyebrow="Ayuda" title={manual.title} />
      <ManualView manual={manual} />
    </>
  );
}
