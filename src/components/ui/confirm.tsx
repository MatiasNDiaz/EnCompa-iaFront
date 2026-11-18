"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { createContext, use, useCallback, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./button";

type ConfirmOptions = {
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger`: acción que borra algo (botón bordó). */
  tone?: "default" | "danger";
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/**
 * `const confirm = useConfirm(); if (await confirm({ title: "¿Eliminar?" })) …`
 * Diálogo de confirmación con la identidad del panel (Base UI AlertDialog: no se
 * cierra tocando afuera; Esc = cancelar).
 */
export function useConfirm(): Confirm {
  const confirm = use(ConfirmContext);
  if (!confirm) throw new Error("useConfirm necesita <ConfirmProvider>.");
  return confirm;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Las opciones se conservan mientras el diálogo se cierra (animación de salida).
  const [options, setOptions] = useState<ConfirmOptions>({ title: "" });
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOpen(false);
  };

  const confirm = useCallback<Confirm>((next) => {
    resolver.current?.(false);
    setOptions(next);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const danger = options.tone === "danger";

  return (
    <ConfirmContext value={confirm}>
      {children}
      <AlertDialog.Root open={open} onOpenChange={(next) => !next && settle(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Backdrop className="fixed inset-0 z-[60] bg-espresso/45 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-[60] w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background p-7 shadow-[0_30px_70px_-30px_rgb(48_36_27/0.7)] transition-[opacity,scale] duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
            <AlertDialog.Title className="font-serif text-[1.7rem] leading-tight">
              {options.title}
            </AlertDialog.Title>
            {options.description && (
              <AlertDialog.Description className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                {options.description}
              </AlertDialog.Description>
            )}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="outline" className="h-11 px-5" onClick={() => settle(false)}>
                {options.cancelLabel ?? "Cancelar"}
              </Button>
              <Button
                className={cn(
                  "h-11 px-5",
                  danger && "bg-vermouth text-cream hover:bg-vermouth/85",
                )}
                onClick={() => settle(true)}
              >
                {options.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext>
  );
}
