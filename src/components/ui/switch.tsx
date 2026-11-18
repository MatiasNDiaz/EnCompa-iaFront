"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Interruptor (Base UI Switch): rol "switch", se maneja con Espacio. Área táctil de 44 px. */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-caramel/45 p-0.5 transition-colors duration-200",
        "before:absolute before:-inset-2 before:content-[''] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive",
        "data-checked:bg-olive data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-6 rounded-full bg-cream shadow-sm transition-transform duration-200 ease-soft data-checked:translate-x-5 motion-reduce:transition-none" />
    </SwitchPrimitive.Root>
  );
}
