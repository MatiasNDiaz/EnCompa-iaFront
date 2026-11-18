import { ArrowRight, Check, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminCard, AdminPageHeader } from "@/components/admin/admin-page-header";
import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";
import { getMenuHealth } from "@/features/admin/dashboard/queries";
import { getAdminSpecials } from "@/features/admin/specials/queries";
import { momentLabel } from "@/features/specials/moments";
import { getAdminStatus } from "@/lib/auth/admin";
import { barLongDate, barMinutes } from "@/lib/time";

export const metadata: Metadata = { title: "Inicio" };

function greeting(minutes: number) {
  if (minutes >= 5 * 60 && minutes < 12 * 60) return "Buen día";
  if (minutes >= 12 * 60 && minutes < 20 * 60) return "Buenas tardes";
  return "Buenas noches";
}

const QUICK_ACTIONS: {
  href: string;
  title: string;
  text: string;
  icon: BrandIconName;
}[] = [
  {
    href: "/admin/carta?nuevo=producto",
    title: "Nuevo producto",
    text: "Sumá un plato, un trago o un café a la carta.",
    icon: "taza",
  },
  {
    href: "/admin/carta?nueva=seccion",
    title: "Nueva sección",
    text: "Creá una sección con su foto y su texto.",
    icon: "copa",
  },
  {
    href: "/admin/plato-del-dia",
    title: "Plato del día",
    text: "Elegí qué recomendar a la mañana, al mediodía y a la noche.",
    icon: "plato",
  },
];

export default async function AdminDashboardPage() {
  const [auth, health, specials] = await Promise.all([
    getAdminStatus(),
    getMenuHealth(),
    getAdminSpecials(),
  ]);
  const firstName = auth.status === "admin" ? auth.fullName?.trim().split(/\s+/)[0] : undefined;
  const withoutSpecial = specials.filter((special) => !special.isPublished).length;

  const toReview = [
    {
      count: withoutSpecial,
      label: withoutSpecial === 1 ? "momento sin plato del día" : "momentos sin plato del día",
      hint:
        withoutSpecial === specials.length
          ? "Todavía no hay ningún plato del día publicado."
          : `Publicados: ${specials
              .filter((special) => special.isPublished)
              .map((special) => momentLabel(special.moment).toLowerCase())
              .join(", ")}.`,
      href: "/admin/plato-del-dia",
    },
    {
      count: health.outToday,
      label: health.outToday === 1 ? "producto sin stock hoy" : "productos sin stock hoy",
      hint: "Se ven atenuados en la carta. Mañana vuelven solos.",
      href: "/admin/carta?filtro=sin-stock",
    },
    {
      count: health.withoutPrice,
      label: health.withoutPrice === 1 ? "producto sin precio" : "productos sin precio",
      hint: "En la web se ven sin precio.",
      href: "/admin/carta?filtro=sin-precio",
    },
    {
      count: health.withoutPhoto,
      label: health.withoutPhoto === 1 ? "producto sin foto propia" : "productos sin foto propia",
      hint: "Hoy muestran una imagen ilustrativa. Cuando puedas, subí la foto real.",
      href: "/admin/carta?filtro=sin-foto",
    },
    {
      count: health.hidden,
      label: health.hidden === 1 ? "producto oculto" : "productos ocultos",
      hint: "No aparecen en la carta de la web.",
      href: "/admin/carta?filtro=ocultos",
    },
  ];
  const pending = toReview.filter((item) => item.count > 0);

  return (
    <>
      <AdminPageHeader
        eyebrow={barLongDate()}
        title={`${greeting(barMinutes())}${firstName ? `, ${firstName}` : ""}`}
        description="Desde acá actualizás la carta y el plato del día. Los cambios se ven en la web al instante."
      />

      <section aria-labelledby="accesos" className="mb-12">
        <h2 id="accesos" className="sr-only">
          Accesos rápidos
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <li key={action.href} className="flex">
              <Link
                href={action.href}
                className="group flex w-full items-center gap-4 rounded-3xl border border-caramel/25 bg-card p-5 shadow-[0_12px_32px_-24px_rgb(72_54_41/0.45)] transition-[transform,box-shadow,border-color] duration-500 ease-soft hover:-translate-y-0.5 hover:border-caramel/50 hover:shadow-[0_22px_40px_-24px_rgb(72_54_41/0.55)] active:translate-y-0 md:flex-col md:items-start md:gap-0 md:p-6"
              >
                <span className="inline-flex size-13 shrink-0 items-center justify-center rounded-full bg-secondary text-terracotta md:mb-5">
                  <BrandIcon name={action.icon} className="size-9" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-serif text-[1.5rem] leading-tight md:text-[1.65rem]">
                    {action.title}
                  </span>
                  <span className="mt-1 text-sm leading-relaxed text-muted-foreground md:mt-1.5">
                    {action.text}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.6}
                  className="size-5 shrink-0 text-olive transition-transform duration-500 ease-soft group-hover:translate-x-1 md:mt-5"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AdminCard>
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          <h2 className="font-serif text-[1.9rem] leading-tight">Para revisar</h2>
          <p className="text-sm text-muted-foreground">
            {health.products} {health.products === 1 ? "producto" : "productos"} en la carta
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="flex items-center gap-3 rounded-2xl bg-secondary px-5 py-4 text-[0.95rem]">
            <Check aria-hidden className="size-5 text-olive" />
            Todo en orden: cada producto tiene precio y foto, y hay plato del día para cada momento.
          </p>
        ) : (
          <ul className="-mx-2 divide-y divide-caramel/20">
            {pending.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex min-h-16 items-center gap-4 rounded-2xl px-2 py-4 transition-colors hover:bg-secondary/60"
                >
                  <span className="w-12 shrink-0 text-center font-serif text-[2rem] leading-none text-terracotta tabular-nums">
                    {item.count}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-sm text-muted-foreground">{item.hint}</span>
                  </span>
                  <ChevronRight
                    aria-hidden
                    className="size-5 shrink-0 text-olive transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </>
  );
}
