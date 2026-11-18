"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Menús desplegables del panel (Base UI Menu: teclado, foco y submenús accesibles). */
export const MenuRoot = Menu.Root;
export const MenuTrigger = Menu.Trigger;
export const SubmenuRoot = Menu.SubmenuRoot;

const POPUP =
  "z-50 min-w-56 max-w-[min(20rem,calc(100vw-2rem))] origin-(--transform-origin) rounded-2xl border border-caramel/30 bg-background p-1.5 text-foreground shadow-[0_20px_50px_-24px_rgb(48_36_27/0.55)] outline-none transition-[opacity,scale] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none";

const ITEM =
  "flex min-h-11 cursor-default items-center gap-3 rounded-xl px-3 py-2 text-[0.95rem] outline-none select-none data-disabled:opacity-50 data-highlighted:bg-secondary [&_svg]:size-4.5 [&_svg]:shrink-0 [&_svg]:text-olive";

export function MenuContent({
  children,
  align = "end",
  side = "bottom",
  className,
}: {
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "bottom" | "top" | "left" | "right" | "inline-end";
  className?: string;
}) {
  return (
    <Menu.Portal>
      <Menu.Positioner align={align} side={side} sideOffset={6} className="z-50 outline-none">
        <Menu.Popup className={cn(POPUP, className)}>{children}</Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export function MenuItem({
  className,
  tone,
  ...props
}: ComponentProps<typeof Menu.Item> & { tone?: "danger" }) {
  return (
    <Menu.Item
      className={cn(ITEM, tone === "danger" && "text-vermouth [&_svg]:text-vermouth", className)}
      {...props}
    />
  );
}

export function SubmenuTrigger({ children, className, ...props }: ComponentProps<typeof Menu.SubmenuTrigger>) {
  return (
    <Menu.SubmenuTrigger className={cn(ITEM, "data-popup-open:bg-secondary", className)} {...props}>
      {children}
      <ChevronRight aria-hidden className="ml-auto !text-muted-foreground" />
    </Menu.SubmenuTrigger>
  );
}

export function MenuSeparator() {
  return <Menu.Separator className="mx-2 my-1.5 h-px bg-caramel/25" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <p className="eyebrow px-3 pt-2 pb-1 text-[0.62rem] text-muted-foreground">{children}</p>;
}
