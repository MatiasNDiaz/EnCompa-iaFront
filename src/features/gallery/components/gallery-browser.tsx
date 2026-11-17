"use client";

import { useState } from "react";

import { LightboxGallery, type LightboxItem } from "@/components/shared/lightbox-gallery";
import { cn } from "@/lib/utils";

export type GalleryEntry = LightboxItem & { category: string };

/** Filtro por categoría (Client Component acotado) + grilla con visor a pantalla completa. */
export function GalleryBrowser({
  entries,
  categories,
}: {
  entries: GalleryEntry[];
  categories: readonly { key: string; label: string }[];
}) {
  const [filter, setFilter] = useState<string | null>(null);
  // Solo categorías con contenido: ningún filtro que lleve a una grilla vacía.
  const available = categories.filter((c) => entries.some((e) => e.category === c.key));
  const visible = filter ? entries.filter((e) => e.category === filter) : entries;

  return (
    <>
      {available.length > 1 && (
        <div
          role="group"
          aria-label="Filtrar por categoría"
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          {[{ key: null, label: "Todo" }, ...available].map((c) => (
            <button
              key={c.key ?? "todo"}
              type="button"
              aria-pressed={filter === c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm transition-colors",
                filter === c.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-foreground/40 hover:bg-secondary",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <LightboxGallery
        key={filter ?? "todo"}
        label="Galería"
        items={visible}
        className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
        thumbClassName="aspect-[4/5]"
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
      />
    </>
  );
}
