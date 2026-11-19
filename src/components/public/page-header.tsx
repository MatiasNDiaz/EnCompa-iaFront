import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Cabecera de página: el único h1, centrado, con ornamento delicado. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("container-site pt-14 pb-10 text-center md:pt-24 md:pb-16", className)}>
      {/* eager: el encabezado está siempre en la primera pantalla. */}
      <Reveal eager>
        <div className="rule-ornament mb-6" aria-hidden>
          <span className="size-1.5 rotate-45 bg-current" />
        </div>
        {eyebrow && <p className="eyebrow mb-4 text-olive">{eyebrow}</p>}
        <h1 className="text-h1">{title}</h1>
        {intro && (
          <div className="mx-auto mt-5 max-w-2xl text-lead text-muted-foreground">{intro}</div>
        )}
      </Reveal>
    </header>
  );
}
