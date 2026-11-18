"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Panel lateral para formularios (Base UI Dialog: foco atrapado, Esc cierra, el resto
 * queda inerte).
 * - Desktop: entra desde la derecha, alto completo.
 * - Mobile: sube desde abajo ("bottom sheet") y ocupa casi toda la pantalla.
 * Controlado: quien lo usa decide si se puede cerrar (p. ej. cambios sin guardar).
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "form",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** `list`: más bajo en mobile (elegir una opción). */
  size?: "form" | "list";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-espresso/45 backdrop-blur-[2px] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          className={cn(
            "fixed z-50 flex flex-col bg-background text-foreground shadow-[0_-20px_60px_-20px_rgb(48_36_27/0.5)] outline-none",
            "transition-transform duration-500 ease-soft motion-reduce:transition-none",
            // Mobile: bottom sheet
            "inset-x-0 bottom-0 rounded-t-3xl data-ending-style:translate-y-full data-starting-style:translate-y-full",
            size === "form" ? "h-[94dvh]" : "max-h-[80dvh]",
            // Desktop: panel derecho
            "md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-none md:w-[min(36rem,100vw)] md:rounded-l-3xl md:rounded-tr-none",
            "md:data-ending-style:translate-x-full md:data-ending-style:translate-y-0 md:data-starting-style:translate-x-full md:data-starting-style:translate-y-0",
          )}
        >
          <div aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-caramel/50 md:hidden" />
          <header className="flex shrink-0 items-start gap-4 border-b border-caramel/25 px-6 pt-4 pb-5 md:px-8 md:pt-8">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-serif text-[1.9rem] leading-tight">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Cerrar"
              className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </header>
          {children}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Cuerpo con scroll propio. */
export function SheetBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-8", className)}>{children}</div>
  );
}

/** Botonera fija abajo. */
export function SheetFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-caramel/25 bg-background px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-end md:px-8 md:pb-6">
      {children}
    </div>
  );
}
