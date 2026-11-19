"use client";

import {
  BookOpen,
  CircleHelp,
  CircleUserRound,
  Clock,
  Ellipsis,
  ExternalLink,
  House,
  Newspaper,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Sheet, SheetBody } from "@/components/ui/sheet";
import { ADMIN_NAV, type AdminNavIcon } from "@/config/admin";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { cn } from "@/lib/utils";

const ICONS: Record<AdminNavIcon, LucideIcon> = {
  inicio: House,
  carta: BookOpen,
  plato: UtensilsCrossed,
  horarios: Clock,
  novedades: Newspaper,
  cuenta: CircleUserRound,
  ayuda: CircleHelp,
};

const BAR_ITEMS = ADMIN_NAV.filter((item) => item.inBar);
const MORE_ITEMS = ADMIN_NAV.filter((item) => !item.inBar);

const BAR_ITEM_CLASS =
  "relative flex min-h-16 w-full flex-col items-center justify-center gap-1 px-1 text-[0.7rem] font-medium tracking-wide transition-colors";

function ActiveLine({ active }: { active: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-4 top-0 h-0.5 rounded-full bg-caramel transition-opacity",
        active ? "opacity-100" : "opacity-0",
      )}
    />
  );
}

/**
 * Navegación del panel.
 * - `sidebar`: lista vertical (desktop). El activo lleva una barra caramelo a la izquierda.
 * - `bar`: barra inferior fija (mobile), a mano del pulgar. El activo, una línea caramelo
 *   arriba. Las secciones de todos los días van en la barra y "Más" abre el resto.
 */
export function AdminNav({ variant }: { variant: "sidebar" | "bar" }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const [moreOpen, setMoreOpen] = useState(false);

  if (variant === "bar") {
    const moreActive = MORE_ITEMS.some((item) => isActive(item.href));
    return (
      <>
        <ul className="grid grid-cols-5">
          {BAR_ITEMS.map(({ href, label, icon }) => {
            const Icon = ICONS[icon];
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    BAR_ITEM_CLASS,
                    active ? "text-cream" : "text-cream/65 hover:text-cream",
                  )}
                >
                  <ActiveLine active={active} />
                  <Icon aria-hidden className="size-5" strokeWidth={1.6} />
                  <span className="leading-tight">{label}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen(true)}
              className={cn(
                BAR_ITEM_CLASS,
                moreActive ? "text-cream" : "text-cream/65 hover:text-cream",
              )}
            >
              <ActiveLine active={moreActive} />
              <Ellipsis aria-hidden className="size-5" strokeWidth={1.6} />
              <span className="leading-tight">Más</span>
            </button>
          </li>
        </ul>

        <Sheet open={moreOpen} onOpenChange={setMoreOpen} title="Más" size="list">
          <SheetBody className="flex flex-col gap-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <ul className="flex flex-col gap-1">
              {MORE_ITEMS.map(({ href, label, icon }) => {
                const Icon = ICONS[icon];
                const active = isActive(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        "flex min-h-14 items-center gap-4 rounded-2xl px-4 text-lg transition-colors",
                        active ? "bg-olive/10 font-semibold text-olive" : "hover:bg-secondary",
                      )}
                    >
                      <Icon aria-hidden className="size-5" strokeWidth={1.6} />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-col gap-2 border-t border-caramel/25 pt-4">
              <Link
                href="/"
                target="_blank"
                rel="noopener"
                className="flex min-h-14 items-center gap-4 rounded-2xl px-4 text-lg transition-colors hover:bg-secondary"
              >
                <ExternalLink aria-hidden className="size-5" strokeWidth={1.6} />
                Ver la web
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </Link>
              <LogoutButton className="h-14 justify-start rounded-2xl px-4 text-lg" />
            </div>
          </SheetBody>
        </Sheet>
      </>
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
