import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Botones-enlace de la web pública (los del CMS usan shadcn). */
export const linkButtonVariants = cva(
  "group/link inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold tracking-wide transition-[background-color,color,border-color,transform] duration-300 ease-soft active:scale-[0.98]",
  {
    variants: {
      variant: {
        /** Crema sobre oliva (5,6:1): acción principal. */
        primary:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--color-olive),black_14%)]",
        /** Crema sobre bordó (8,9:1): "Ver carta". */
        accent:
          "bg-accent text-accent-foreground hover:bg-[color-mix(in_oklab,var(--color-vermouth),black_14%)]",
        /** Borde espresso sobre crema. */
        outline:
          "border border-foreground/30 text-foreground hover:border-foreground hover:bg-foreground/5",
        /** Sobre foto u oscuro. */
        light: "border border-cream/60 text-cream hover:bg-cream hover:text-espresso",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type LinkButtonProps = ComponentProps<typeof Link> &
  VariantProps<typeof linkButtonVariants> & {
    children: ReactNode;
    /** Flecha que se desplaza sutilmente en hover/focus. */
    arrow?: boolean;
  };

export function LinkButton({
  children,
  variant,
  className,
  arrow = false,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(linkButtonVariants({ variant }), className)} {...props}>
      {children}
      {arrow && (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 group-hover/link:translate-x-1 group-focus-visible/link:translate-x-1"
        />
      )}
    </Link>
  );
}

/** Enlace de texto con subrayado animado. */
export function TextLink({ children, className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "group/text inline-flex items-center gap-2 text-sm font-semibold tracking-wide",
        "bg-[linear-gradient(currentColor,currentColor)] bg-size-[0%_1px] bg-bottom-left bg-no-repeat pb-1 transition-[background-size] duration-500 ease-soft hover:bg-size-[100%_1px] focus-visible:bg-size-[100%_1px]",
        className,
      )}
      {...props}
    >
      {children}
      <ArrowRight
        aria-hidden
        className="size-4 transition-transform duration-300 group-hover/text:translate-x-1"
      />
    </Link>
  );
}
