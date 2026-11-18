"use client";

import { Toast } from "@base-ui/react/toast";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Avisos del panel (Base UI Toast, sin dependencias extra).
 * `toast.success("Producto guardado", "Ya se ve en la web")` desde cualquier componente cliente.
 * Los avisos se anuncian a lectores de pantalla (los errores con prioridad alta).
 */
const manager = Toast.createToastManager();

export const toast = {
  success: (title: string, description?: string) =>
    manager.add({ title, description, type: "success" }),
  error: (title: string, description?: string) =>
    manager.add({ title, description, type: "error", priority: "high", timeout: 8000 }),
};

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((item) => {
    const isError = item.type === "error";
    const Icon = isError ? CircleAlert : CircleCheck;
    return (
      <Toast.Root
        key={item.id}
        toast={item}
        className={cn(
          "pointer-events-auto flex w-full items-start gap-3 rounded-2xl bg-espresso py-2.5 pr-1.5 pl-4 text-cream shadow-[0_18px_40px_-16px_rgb(48_36_27/0.65)] sm:py-3.5 sm:pr-2",
          "transition-[opacity,transform] duration-300 ease-soft",
          "data-ending-style:translate-y-2 data-ending-style:opacity-0 data-limited:hidden data-starting-style:translate-y-2 data-starting-style:opacity-0",
        )}
      >
        <Icon
          aria-hidden
          strokeWidth={1.8}
          className={cn("mt-0.5 size-5 shrink-0", isError
              ? "text-[color-mix(in_oklab,var(--color-vermouth)_40%,var(--color-cream))]"
              : "text-caramel")}
        />
        <Toast.Content className="min-w-0 flex-1">
          <Toast.Title className="text-sm font-semibold sm:text-[0.95rem]">{item.title}</Toast.Title>
          {item.description && (
            <Toast.Description className="mt-0.5 text-[0.8rem] leading-snug text-cream/80 sm:text-sm">
              {item.description}
            </Toast.Description>
          )}
        </Toast.Content>
        <Toast.Close
          aria-label="Cerrar aviso"
          className="-my-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
        >
          <X aria-hidden className="size-4" />
        </Toast.Close>
      </Toast.Root>
    );
  });
}

export function Toaster({ children }: { children: ReactNode }) {
  return (
    // Un aviso por vez: en mobile varios apilados tapan lo que la persona está editando.
    <Toast.Provider toastManager={manager} limit={1} timeout={4000}>
      {children}
      <Toast.Portal>
        {/* Mobile: arriba de la barra inferior. Desktop: abajo a la derecha. */}
        <Toast.Viewport className="pointer-events-none fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex flex-col gap-2 sm:left-auto sm:w-96 lg:right-8 lg:bottom-8">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
