"use client";

import { ArrowLeft, FolderPlus, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BRAND_IMAGES } from "@/assets/brand";
import { Button } from "@/components/ui/button";
import { CategoryBanner } from "@/features/menu/components/category-banner";

import type { AdminSection } from "../types";
import { useMenuEditor } from "./menu-editor";
import { Badge, MomentIcons, ProductRow, ReorderButtons, SectionMenu } from "./menu-items";

/** /admin/carta/[id]: una sección con su banner, sus productos y sus subsecciones. */
export function SectionDetail({ sectionId }: { sectionId: string }) {
  const editor = useMenuEditor();
  const { menu } = editor;
  const router = useRouter();
  const section = menu.sections.find((s) => s.id === sectionId);

  if (!section) {
    // Se eliminó desde este mismo panel (la página se refresca antes de navegar).
    return (
      <p className="py-20 text-center text-muted-foreground">
        Esta sección ya no existe.{" "}
        <Link href="/admin/carta" className="font-semibold text-olive underline">
          Volver a la carta
        </Link>
      </p>
    );
  }

  const parent = section.parentId ? menu.sections.find((s) => s.id === section.parentId) : null;
  const children = menu.sections.filter((s) => s.parentId === section.id);
  const products = menu.products.filter((p) => p.categoryId === section.id);
  const back = parent ? `/admin/carta/${parent.id}` : "/admin/carta";

  return (
    <>
      <nav aria-label="Ubicación" className="mb-6">
        <Link
          href={back}
          className="group -ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 text-sm font-semibold"
        >
          <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
          {parent ? parent.name : "La carta"}
        </Link>
      </nav>

      <div className="relative mb-8">
        <CategoryBanner
          image={
            section.imageUrl
              ? { src: section.imageUrl, isStock: section.imageIsIllustrative, isPending: false }
              : { src: BRAND_IMAGES.texturaEspresso, isStock: false, isPending: true }
          }
          title={section.name}
          subtitle={section.description}
          as="h1"
          eyebrow={parent ? `Subsección de ${parent.name}` : "Sección de la carta"}
          unoptimized
        />
      </div>

      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Button
            variant="outline"
            className="h-12 px-4 text-[0.95rem] sm:px-5"
            onClick={() => editor.openSection({ section })}
          >
            <Pencil aria-hidden /> Editar sección
          </Button>
          <Button
            className="h-12 px-4 text-[0.95rem] sm:px-5"
            onClick={() => editor.openProduct({ categoryId: section.id })}
          >
            <Plus aria-hidden /> Agregar producto
          </Button>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!section.isActive && <Badge>Oculta</Badge>}
          <MomentIcons
            moments={section.effectiveMoments}
            inherited={section.moments.length === 0 && Boolean(parent)}
          />
          <SectionMenu section={section} className="ml-auto" onDeleted={() => router.push(back)} />
        </div>
      </div>

      {products.length > 0 ? (
        <ul className="mb-12 divide-y divide-caramel/20 rounded-3xl border border-caramel/25 bg-card px-4 sm:px-6">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </ul>
      ) : (
        children.length === 0 && (
          <EmptySection onAdd={() => editor.openProduct({ categoryId: section.id })} />
        )
      )}

      {children.length > 0 && (
        <div className="flex flex-col gap-10">
          {children.map((child) => (
            <Subsection key={child.id} section={child} siblings={children} />
          ))}
        </div>
      )}

      {!parent && (
        <div className="mt-10 border-t border-caramel/25 pt-8">
          <Button
            variant="outline"
            className="h-12 px-5 text-[0.95rem]"
            onClick={() => editor.openSection({ parentId: section.id })}
          >
            <FolderPlus aria-hidden /> Nueva subsección
          </Button>
        </div>
      )}
    </>
  );
}

function Subsection({ section, siblings }: { section: AdminSection; siblings: AdminSection[] }) {
  const editor = useMenuEditor();
  const products = editor.menu.products.filter((p) => p.categoryId === section.id);

  return (
    <section aria-labelledby={`sub-${section.id}`}>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 id={`sub-${section.id}`} className="font-serif text-[1.75rem] leading-tight text-olive">
          {section.name}
        </h2>
        {!section.isActive && <Badge>Oculta</Badge>}
        <span aria-hidden className="hidden h-px flex-1 bg-olive/25 sm:block" />
        <div className="ml-auto flex items-center">
          <ReorderButtons section={section} siblings={siblings} layout="row" />
          <SectionMenu section={section} />
        </div>
      </div>
      {products.length > 0 ? (
        <ul className="divide-y divide-caramel/20 rounded-3xl border border-caramel/25 bg-card px-4 sm:px-6">
          {products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-caramel/50 px-5 py-4 text-sm text-muted-foreground">
          Sin productos todavía: no se ve en la web hasta que agregues uno.
        </p>
      )}
      <Button
        variant="ghost"
        className="mt-2 h-11 px-3 text-olive hover:text-olive"
        onClick={() => editor.openProduct({ categoryId: section.id })}
      >
        <Plus aria-hidden /> Agregar producto en {section.name}
      </Button>
    </section>
  );
}

function EmptySection({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mb-12 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-caramel/50 px-6 py-12 text-center">
      <p className="max-w-sm text-muted-foreground">
        Esta sección todavía no tiene productos, así que no se ve en la web.
      </p>
      <Button className="h-12 px-5" onClick={onAdd}>
        <Plus aria-hidden /> Agregar el primero
      </Button>
    </div>
  );
}
