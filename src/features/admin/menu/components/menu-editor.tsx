"use client";

import { Check, Plus } from "lucide-react";
import { createContext, use, useCallback, useRef, useState, type ReactNode } from "react";

import { Sheet, SheetBody } from "@/components/ui/sheet";
import { useConfirm } from "@/components/ui/confirm";
import { toast } from "@/components/ui/toaster";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { cn } from "@/lib/utils";

import { moveProduct } from "../actions";
import { sectionOptions, sectionPath } from "../tree";
import type { AdminMenu, AdminProduct, AdminSection } from "../types";
import { ProductForm } from "./product-form";
import { SectionForm } from "./section-form";

type SheetState =
  | { type: "product"; product?: AdminProduct; categoryId?: string; key: number }
  | {
      type: "section";
      section?: AdminSection;
      parentId?: string | null;
      onCreated?: (id: string) => void;
      key: number;
    }
  | { type: "move"; product: AdminProduct; key: number };

/** Lo que se pide al abrir (sin la `key`, que la pone el provider). */
type SheetRequest = SheetState extends infer S
  ? S extends unknown
    ? Omit<S, "key">
    : never
  : never;

type MenuEditor = {
  menu: AdminMenu;
  openProduct: (options?: { product?: AdminProduct; categoryId?: string }) => void;
  openSection: (options?: {
    section?: AdminSection;
    parentId?: string | null;
    onCreated?: (id: string) => void;
  }) => void;
  openMove: (product: AdminProduct) => void;
  /** Mover un producto (submenú en desktop, sheet en mobile). */
  move: (product: AdminProduct, categoryId: string) => Promise<void>;
};

const MenuEditorContext = createContext<MenuEditor | null>(null);

export function useMenuEditor() {
  const editor = use(MenuEditorContext);
  if (!editor) throw new Error("useMenuEditor necesita <MenuEditorProvider>.");
  return editor;
}

/**
 * Estado compartido del editor de la carta: los formularios (producto, sección,
 * cambiar de sección) se abren en un panel lateral desde cualquier parte.
 * Lo usan las pantallas del panel y, en la Etapa 3, el modo administrador de la carta.
 */
export function MenuEditorProvider({ menu, children }: { menu: AdminMenu; children: ReactNode }) {
  const confirm = useConfirm();
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const counter = useRef(0);
  // Consulta inmediata del formulario abierto (no depende de que haya corrido un efecto).
  const dirtyCheck = useRef<() => boolean>(() => false);
  const registerDirtyCheck = useCallback((check: () => boolean) => {
    dirtyCheck.current = check;
  }, []);

  useUnsavedChanges(open && dirty);

  const show = useCallback((next: SheetRequest) => {
    counter.current += 1;
    setDirty(false);
    setSheet({ ...next, key: counter.current } as SheetState);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setDirty(false);
    dirtyCheck.current = () => false;
  }, []);

  /** Cerrar con cambios sin guardar pide confirmación. */
  const requestClose = useCallback(async () => {
    if (
      (dirty || dirtyCheck.current()) &&
      !(await confirm({
        title: "¿Descartar los cambios?",
        description: "Tenés cambios sin guardar. Si cerrás ahora se pierden.",
        confirmLabel: "Descartar",
        cancelLabel: "Seguir editando",
        tone: "danger",
      }))
    ) {
      return;
    }
    close();
  }, [dirty, confirm, close]);

  const move = useCallback(
    async (product: AdminProduct, categoryId: string) => {
      if (product.categoryId === categoryId) return;
      const result = await moveProduct(product.id, categoryId);
      if (!result.ok) {
        toast.error("No se pudo mover", result.error);
        return;
      }
      toast.success(
        "Producto movido",
        `«${product.name}» ahora está en ${sectionPath(menu.sections, categoryId)}.`,
      );
    },
    [menu.sections],
  );

  const editor: MenuEditor = {
    menu,
    openProduct: (options = {}) => show({ type: "product", ...options }),
    openSection: (options = {}) => show({ type: "section", ...options }),
    openMove: (product) => show({ type: "move", product }),
    move,
  };

  const titles = {
    product: sheet?.type === "product" && sheet.product ? "Editar producto" : "Nuevo producto",
    section:
      sheet?.type === "section" && sheet.section
        ? "Editar sección"
        : sheet?.type === "section" && sheet.parentId
          ? "Nueva subsección"
          : "Nueva sección",
    move: "Cambiar de sección",
  };

  return (
    <MenuEditorContext value={editor}>
      {children}

      <Sheet
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : void requestClose())}
        title={sheet ? titles[sheet.type] : ""}
        description={
          sheet?.type === "move" ? `¿A qué sección pasa «${sheet.product.name}»?` : undefined
        }
        size={sheet?.type === "move" ? "list" : "form"}
      >
        {sheet?.type === "product" && (
          <ProductForm
            key={sheet.key}
            product={sheet.product}
            defaultCategoryId={sheet.categoryId}
            sections={menu.sections}
            onDirtyChange={setDirty}
            registerDirtyCheck={registerDirtyCheck}
            onDone={close}
            onCancel={() => void requestClose()}
          />
        )}
        {sheet?.type === "section" && (
          <SectionForm
            key={sheet.key}
            section={sheet.section}
            defaultParentId={sheet.parentId}
            sections={menu.sections}
            productCount={
              sheet.section
                ? menu.products.filter((p) => p.categoryId === sheet.section?.id).length
                : 0
            }
            onDirtyChange={setDirty}
            registerDirtyCheck={registerDirtyCheck}
            onDone={(saved) => {
              close();
              if (!sheet.section) sheet.onCreated?.(saved.id);
            }}
            onCancel={() => void requestClose()}
          />
        )}
        {sheet?.type === "move" && (
          <SheetBody className="pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <MoveList
              product={sheet.product}
              sections={menu.sections}
              onPick={async (categoryId) => {
                close();
                await move(sheet.product, categoryId);
              }}
              onCreate={() => {
                const product = sheet.product;
                show({
                  type: "section",
                  onCreated: (id) => void move(product, id),
                });
              }}
            />
          </SheetBody>
        )}
      </Sheet>
    </MenuEditorContext>
  );
}

/** Lista de secciones para mover un producto (mobile). */
function MoveList({
  product,
  sections,
  onPick,
  onCreate,
}: {
  product: AdminProduct;
  sections: AdminSection[];
  onPick: (categoryId: string) => void;
  onCreate: () => void;
}) {
  return (
    <ul className="-mx-2 flex flex-col">
      {sectionOptions(sections).map((option) => {
        const current = option.id === product.categoryId;
        return (
          <li key={option.id}>
            <button
              type="button"
              disabled={current}
              onClick={() => onPick(option.id)}
              className={cn(
                "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-secondary disabled:hover:bg-transparent",
                option.depth === 1 && "pl-8 text-[0.95rem]",
                current && "font-semibold text-olive",
              )}
            >
              <span className="flex-1">{option.label}</span>
              {current && (
                <span className="flex items-center gap-1 text-xs">
                  <Check aria-hidden className="size-4" /> Está acá
                </span>
              )}
            </button>
          </li>
        );
      })}
      <li className="mt-2 border-t border-caramel/25 pt-2">
        <button
          type="button"
          onClick={onCreate}
          className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2 text-left font-medium text-olive transition-colors hover:bg-secondary"
        >
          <Plus aria-hidden className="size-5" /> Crear sección
        </button>
      </li>
    </ul>
  );
}
