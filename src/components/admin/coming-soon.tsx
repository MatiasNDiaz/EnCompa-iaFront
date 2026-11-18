import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";

import { AdminCard } from "./admin-page-header";

/** Lugar reservado para una pantalla del panel que todavía se está armando. */
export function ComingSoon({ icon, text }: { icon: BrandIconName; text: string }) {
  return (
    <AdminCard className="flex flex-col items-center gap-4 py-14 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-terracotta">
        <BrandIcon name={icon} className="size-8" />
      </span>
      <p className="max-w-sm text-muted-foreground">{text}</p>
    </AdminCard>
  );
}
