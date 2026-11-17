import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  /** h1 solo en la cabecera de cada página (un único h1 por página). */
  as?: "h1" | "h2";
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  as: Heading = "h2",
  intro,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <Reveal className={cn(align === "center" && "mx-auto text-center", "max-w-3xl", className)}>
      {eyebrow && (
        <p className={cn("eyebrow mb-4 text-olive", align === "center" && "rule-ornament")}>
          {eyebrow}
        </p>
      )}
      <Heading className={Heading === "h1" ? "text-h1" : "text-h2"}>{title}</Heading>
      {intro && <div className="mt-5 text-lead text-muted-foreground">{intro}</div>}
    </Reveal>
  );
}
