"use client";

import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Eye,
  EyeOff,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";
import { useConfirm } from "@/components/ui/confirm";
import { MenuContent, MenuItem, MenuRoot, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { toast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

import { deleteSection, reorderSections, setSectionVisibility } from "../actions";
import { isOutToday, productsUnder } from "../tree";
import type { AdminProduct, AdminSection, DayMomentValue } from "../types";
import { useMenuEditor } from "./menu-editor";
import { PriceInline } from "./price-inline";
import { ProductMenu } from "./product-menu";

export const MOMENT_ICON: Record<DayMomentValue, BrandIconName> = {
  morning: "taza",
  midday: "plato",
  evening: "copa",
};

const MOMENT_LABEL: Record<DayMomentValue, string> = {
  morning: "Mañana",
  midday: "Mediodía",
  evening: "Tarde / Noche",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "olive" | "warning" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-wide",
        tone === "neutral" && "bg-espresso/8 text-espresso",
        tone === "olive" && "bg-olive/12 text-olive",
        tone === "warning" && "bg-vermouth/10 text-vermouth",
        tone === "muted" && "bg-secondary text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

/** Momentos del día en texto ("Mañana · Mediodía"), con el ícono de cada uno. */
export function MomentIcons({ moments, inherited }: { moments: DayMomentValue[]; inherited?: boolean }) {
  if (moments.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {inherited && <span className="text-xs text-muted-foreground">Hereda:</span>}
      {moments.map((m) => (
        <span
          key={m}
          className="inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-0.5 text-[0.72rem] font-semibold text-terracotta"
        >
          <BrandIcon name={MOMENT_ICON[m]} className="h-3.5 w-4" />
          {MOMENT_LABEL[m]}
        </span>
      ))}
    </span>
  );
}

/** Miniatura del producto: foto propia o la de respaldo (marcada como ilustrativa). */
function ProductThumb({ product }: { product: AdminProduct }) {
  return (
    <span className="relative block size-14 shrink-0 overflow-hidden rounded-xl bg-secondary">
      {product.thumbUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.thumbUrl}
          alt=""
          loading="lazy"
          className={cn("size-full object-cover", !product.isAvailable && "opacity-50 grayscale")}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-olive/60">
          <ImageOff aria-hidden className="size-5" strokeWidth={1.5} />
        </span>
      )}
    </span>
  );
}

/** Fila de producto: foto, nombre, estados, precio editable y menú ⋯. */
export function ProductRow({ product, path }: { product: AdminProduct; path?: string }) {
  const { menu } = useMenuEditor();
  const outToday = isOutToday(product, menu.today);

  return (
    <li className="flex items-start gap-3 py-3.5 sm:items-center sm:gap-4" data-product-id={product.id}>
      <ProductThumb product={product} />
      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className={cn("font-medium leading-snug", !product.isAvailable && "text-muted-foreground")}>
            {product.name}
          </p>
          {path && <p className="mt-0.5 text-xs text-muted-foreground">{path}</p>}
          {(product.isFeatured || !product.isAvailable || outToday) && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.isFeatured && <Badge tone="olive">De la casa</Badge>}
              {!product.isAvailable && (
                <Badge>
                  <EyeOff aria-hidden className="size-3" /> Oculto
                </Badge>
              )}
              {outToday && <Badge tone="warning">Sin stock hoy</Badge>}
            </div>
          )}
        </div>
        <div className="mt-2 sm:mt-0">
          <PriceInline productId={product.id} productName={product.name} price={product.price} />
        </div>
      </div>
      <ProductMenu product={product} />
    </li>
  );
}

/** Menú ⋯ de una sección: Editar · Ver en la web · Ocultar/Mostrar · Eliminar. */
export function SectionMenu({
  section,
  onDeleted,
  className,
}: {
  section: AdminSection;
  onDeleted?: () => void;
  className?: string;
}) {
  const editor = useMenuEditor();
  const confirm = useConfirm();
  const productCount = editor.menu.products.filter((p) => p.categoryId === section.id).length;
  const childCount = editor.menu.sections.filter((s) => s.parentId === section.id).length;
  const root = section.parentId
    ? editor.menu.sections.find((s) => s.id === section.parentId)
    : section;

  const onDelete = async () => {
    if (productCount > 0 || childCount > 0) {
      const parts = [
        productCount > 0 && `${productCount} ${productCount === 1 ? "producto" : "productos"}`,
        childCount > 0 && `${childCount} ${childCount === 1 ? "subsección" : "subsecciones"}`,
      ].filter(Boolean);
      toast.error(`No se puede eliminar «${section.name}»`, `Tiene ${parts.join(" y ")}. Movelos o eliminalos primero.`);
      return;
    }
    const ok = await confirm({
      title: `¿Eliminar «${section.name}»?`,
      description: "La sección está vacía. Se borra junto con la foto del banner. No se puede deshacer.",
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;
    const result = await deleteSection(section.id);
    if (!result.ok) {
      toast.error("No se pudo eliminar", result.error);
      return;
    }
    toast.success("Sección eliminada");
    onDeleted?.();
  };

  const toggle = async () => {
    const result = await setSectionVisibility(section.id, !section.isActive);
    if (!result.ok) toast.error("No se pudo cambiar", result.error);
    else
      toast.success(
        section.isActive ? "Sección oculta" : "Sección visible",
        section.isActive ? "Ya no aparece en la web." : "Ya se ve en la web.",
      );
  };

  return (
    <MenuRoot>
      <MenuTrigger
        aria-label={`Opciones de la sección ${section.name}`}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-popup-open:bg-secondary",
          className,
        )}
      >
        <MoreHorizontal aria-hidden className="size-5" />
      </MenuTrigger>
      <MenuContent>
        <MenuItem onClick={() => editor.openSection({ section })}>
          <Pencil aria-hidden /> Editar sección
        </MenuItem>
        {root && (
          <MenuItem onClick={() => window.open(`/carta/${root.slug}`, "_blank", "noopener")}>
            <ExternalLink aria-hidden /> Ver en la web
          </MenuItem>
        )}
        <MenuItem onClick={() => void toggle()}>
          {section.isActive ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
          {section.isActive ? "Ocultar de la carta" : "Mostrar en la carta"}
        </MenuItem>
        <MenuSeparator />
        <MenuItem tone="danger" onClick={() => void onDelete()}>
          <Trash2 aria-hidden /> Eliminar sección
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}

/** ↑ ↓ para reordenar secciones hermanas (botones de 44 px, accesibles con teclado). */
export function ReorderButtons({
  section,
  siblings,
  layout = "responsive",
}: {
  section: AdminSection;
  siblings: AdminSection[];
  /** `responsive`: en columna en mobile (tarjetas altas), en fila desde sm. */
  layout?: "responsive" | "row";
}) {
  const router = useRouter();
  const index = siblings.findIndex((s) => s.id === section.id);

  const moveTo = async (target: number) => {
    const ids = siblings.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const result = await reorderSections(ids);
    if (!result.ok) toast.error("No se pudo reordenar", result.error);
    router.refresh();
  };

  const button =
    "inline-flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className={cn("flex shrink-0", layout === "responsive" && "flex-col sm:flex-row")}>
      <button
        type="button"
        className={button}
        disabled={index <= 0}
        onClick={() => void moveTo(index - 1)}
        aria-label={`Subir ${section.name}`}
      >
        <ArrowUp aria-hidden className="size-4.5" />
      </button>
      <button
        type="button"
        className={button}
        disabled={index === siblings.length - 1}
        onClick={() => void moveTo(index + 1)}
        aria-label={`Bajar ${section.name}`}
      >
        <ArrowDown aria-hidden className="size-4.5" />
      </button>
    </div>
  );
}

export function sectionCounts(menu: { sections: AdminSection[]; products: AdminProduct[] }, section: AdminSection) {
  const products = productsUnder(menu, section.id).length;
  const children = menu.sections.filter((s) => s.parentId === section.id).length;
  return { products, children };
}
