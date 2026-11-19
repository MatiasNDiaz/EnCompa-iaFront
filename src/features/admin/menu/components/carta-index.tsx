"use client";

import { ChevronRight, FolderPlus, Plus, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FILTERS, isFilterKey, searchProducts, sectionPath, sectionTree, type FilterKey } from "../tree";
import { useMenuEditor } from "./menu-editor";
import { Badge, MomentIcons, ProductRow, ReorderButtons, SectionMenu, sectionCounts } from "./menu-items";

/**
 * /admin/carta: toda la carta como en la web (secciones → subsecciones → productos),
 * con buscador y filtros (sin precio, sin foto propia, ocultos, sin stock hoy).
 * `?nuevo=producto` y `?nueva=seccion` (accesos rápidos del Inicio) abren el formulario.
 */
export function CartaIndex() {
  const editor = useMenuEditor();
  const { menu } = editor;
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState("");

  const rawFilter = params.get("filtro");
  const filter: FilterKey | null = isFilterKey(rawFilter) ? rawFilter : null;
  const searching = query.trim() !== "" || filter !== null;

  // Accesos rápidos del Inicio: abrir el formulario una vez y limpiar la URL.
  const intent = params.get("nuevo") === "producto" ? "producto" : params.get("nueva") === "seccion" ? "seccion" : null;
  useEffect(() => {
    if (!intent) return;
    if (intent === "producto") editor.openProduct();
    else editor.openSection();
    router.replace(pathname, { scroll: false });
    // Solo al llegar con el parámetro.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intent]);

  const setFilter = (next: FilterKey | null) => {
    const search = new URLSearchParams(params);
    if (next) search.set("filtro", next);
    else search.delete("filtro");
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const tree = sectionTree(menu.sections);
  const results = searching ? searchProducts(menu, query, filter) : [];

  return (
    <>
      <AdminPageHeader
        eyebrow="Carta"
        title="La carta"
        description="Tocá una sección para ver sus productos. Los cambios se ven en la web al instante."
        actions={
          <>
            <Button variant="outline" className="h-12 px-5 text-[0.95rem]" onClick={() => editor.openSection()}>
              <FolderPlus aria-hidden /> Nueva sección
            </Button>
            <Button className="h-12 px-5 text-[0.95rem]" onClick={() => editor.openProduct()}>
              <Plus aria-hidden /> Nuevo producto
            </Button>
          </>
        }
      />

      <div className="mb-8 flex flex-col gap-4">
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar un producto, un ingrediente o una sección"
            aria-label="Buscar en la carta"
            className="h-13 w-full rounded-2xl border border-caramel/40 bg-card pr-12 pl-12 text-base shadow-[0_8px_24px_-20px_rgb(72_54_41/0.5)] outline-none placeholder:text-muted-foreground/80 focus-visible:border-olive focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          {query && (
            <button
              type="button"
              aria-label="Borrar la búsqueda"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-1.5 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
            >
              <X aria-hidden className="size-4" />
            </button>
          )}
        </div>

        <div role="group" aria-label="Filtrar productos" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {(Object.keys(FILTERS) as FilterKey[]).map((key) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(active ? null : key)}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-espresso bg-espresso text-cream"
                    : "border-caramel/40 bg-card text-foreground hover:border-caramel",
                )}
              >
                {FILTERS[key].label}
                {active && <X aria-hidden className="size-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {searching ? (
        <section aria-live="polite" aria-label="Resultados">
          <p className="mb-2 text-sm text-muted-foreground">
            {results.length === 0
              ? "No encontramos productos con esa búsqueda."
              : `${results.length} ${results.length === 1 ? "producto" : "productos"}`}
          </p>
          {results.length > 0 && (
            <ul className="divide-y divide-caramel/20 rounded-3xl border border-caramel/25 bg-card px-4 sm:px-6">
              {results.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  path={sectionPath(menu.sections, product.categoryId)}
                />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Secciones de la carta">
          {tree.map((section) => {
            const counts = sectionCounts(menu, section);
            return (
              <li
                key={section.id}
                className="flex items-center gap-1 rounded-3xl border border-caramel/25 bg-card p-2.5 pr-1.5 shadow-[0_10px_28px_-24px_rgb(72_54_41/0.5)] sm:gap-2 sm:p-3"
              >
                <Link
                  href={`/admin/carta/${section.id}`}
                  className="group flex min-w-0 flex-1 items-center gap-4 rounded-2xl p-1"
                >
                  <span className="relative block h-16 w-20 shrink-0 overflow-hidden rounded-2xl bg-espresso sm:h-20 sm:w-32">
                    {section.imageUrl && (
                      <Image
                        src={section.imageUrl}
                        alt=""
                        fill
                        sizes="(min-width: 640px) 8rem, 5rem"
                        className={cn(
                          "size-full object-cover transition-transform duration-500 group-hover:scale-105",
                          !section.isActive && "opacity-50 grayscale",
                        )}
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="font-serif text-[1.45rem] leading-tight sm:text-[1.6rem]">{section.name}</span>
                      {!section.isActive && <Badge>Oculta</Badge>}
                    </span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>
                        {counts.products} {counts.products === 1 ? "producto" : "productos"}
                        {counts.children > 0 &&
                          ` · ${counts.children} ${counts.children === 1 ? "subsección" : "subsecciones"}`}
                      </span>
                      <MomentIcons moments={section.moments} />
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="hidden size-5 shrink-0 text-olive transition-transform group-hover:translate-x-0.5 sm:block" />
                </Link>
                <ReorderButtons section={section} siblings={tree} />
                <SectionMenu section={section} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
