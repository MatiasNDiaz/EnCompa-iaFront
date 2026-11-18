"use client";

import { BookOpen, CircleUserRound, House, UtensilsCrossed, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV, type AdminNavIcon } from "@/config/admin";
import { cn } from "@/lib/utils";

const ICONS: Record<AdminNavIcon, LucideIcon> = {
  inicio: House,
  carta: BookOpen,
  plato: UtensilsCrossed,
  cuenta: CircleUserRound,
};

/**
 * Navegación del panel.
 * - `sidebar`: lista vertical (desktop). El activo lleva una barra caramelo a la izquierda.
 * - `bar`: barra inferior fija (mobile), a mano del pulgar. El activo, una línea caramelo arriba.
 */
export function AdminNav({ variant }: { variant: "sidebar" | "bar" }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "bar") {
    return (
      <ul className="grid grid-cols-4">
        {ADMIN_NAV.map(({ href, label, icon }) => {
          const Icon = ICONS[icon];
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[0.7rem] font-medium tracking-wide transition-colors",
                  active ? "text-cream" : "text-cream/65 hover:text-cream",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-5 top-0 h-0.5 rounded-full bg-caramel transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon aria-hidden className="size-5" strokeWidth={1.6} />
                <span className="leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {ADMIN_NAV.map(({ href, label, icon }) => {
        const Icon = ICONS[icon];
        const active = isActive(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex min-h-11 items-center gap-3.5 rounded-xl px-4 py-2.5 text-[0.95rem] transition-colors duration-300",
                active
                  ? "bg-cream/10 font-semibold text-cream"
                  : "text-cream/75 hover:bg-cream/5 hover:text-cream",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-2 left-0 w-1 rounded-full bg-caramel transition-opacity duration-300",
                  active ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                aria-hidden
                strokeWidth={1.6}
                className={cn(
                  "size-5 transition-colors",
                  active ? "text-caramel" : "text-cream/70 group-hover:text-cream",
                )}
              />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
