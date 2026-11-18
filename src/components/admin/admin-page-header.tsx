import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Encabezado de cada pantalla del panel: rótulo, título en Cormorant y una bajada breve. */
export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow && <p className="eyebrow mb-3 text-terracotta">{eyebrow}</p>}
        <h1 className="font-serif text-[2.4rem] leading-[1.05] md:text-[3.2rem]">{title}</h1>
        {description && (
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}

/** Tarjeta suave del panel. */
export function AdminCard({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <Tag
      className={cn(
        "rounded-3xl border border-caramel/25 bg-card p-6 shadow-[0_12px_32px_-24px_rgb(72_54_41/0.45)] sm:p-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
