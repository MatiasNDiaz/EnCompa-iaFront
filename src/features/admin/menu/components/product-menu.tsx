"use client";

import {
  ArrowRightLeft,
  Check,
  Eye,
  EyeOff,
  MoreHorizontal,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { useConfirm } from "@/components/ui/confirm";
import {
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  SubmenuRoot,
  SubmenuTrigger,
} from "@/components/ui/menu";
import { toast } from "@/components/ui/toaster";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { deleteProduct, setProductStock, setProductVisibility } from "../actions";
import { isOutToday, sectionOptions } from "../tree";
import type { AdminProduct } from "../types";
import { useMenuEditor } from "./menu-editor";

/**
 * Menú ⋯ de cada producto (panel y modo administrador de la carta):
 * Editar · Cambiar de sección › · Sin stock por hoy / Disponible otra vez ·
 * Ocultar / Mostrar · Eliminar.
 * En mobile "Cambiar de sección" abre un panel desde abajo en lugar del submenú.
 */
export function ProductMenu({ product, className }: { product: AdminProduct; className?: string }) {
  const editor = useMenuEditor();
  const confirm = useConfirm();
  const touch = useMediaQuery("(max-width: 767px)");
  const outToday = isOutToday(product, editor.menu.today);

  const run = async (
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
    success: [string, string?],
  ) => {
    const result = await action();
    if (result.ok) toast.success(...success);
    else toast.error("No se pudo completar", result.error);
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: `¿Eliminar «${product.name}»?`,
      description: product.imagePath
        ? "Se borra de la carta junto con su foto. No se puede deshacer."
        : "Se borra de la carta. No se puede deshacer.",
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (ok) await run(() => deleteProduct(product.id), ["Producto eliminado", "Ya no aparece en la web."]);
  };

  return (
    <MenuRoot>
      <MenuTrigger
        aria-label={`Opciones de ${product.name}`}
        className={cn(
          "inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-popup-open:bg-secondary data-popup-open:text-foreground",
          className,
        )}
      >
        <MoreHorizontal aria-hidden className="size-5" />
      </MenuTrigger>
      <MenuContent>
        <MenuItem onClick={() => editor.openProduct({ product })}>
          <Pencil aria-hidden /> Editar
        </MenuItem>

        {touch ? (
          <MenuItem onClick={() => editor.openMove(product)}>
            <ArrowRightLeft aria-hidden /> Cambiar de sección
          </MenuItem>
        ) : (
          <SubmenuRoot>
            <SubmenuTrigger>
              <ArrowRightLeft aria-hidden /> Cambiar de sección
            </SubmenuTrigger>
            <MenuContent side="inline-end" align="start" className="max-h-[min(26rem,var(--available-height))] overflow-y-auto">
              <MenuLabel>Mover a</MenuLabel>
              {sectionOptions(editor.menu.sections).map((option) => {
                const current = option.id === product.categoryId;
                return (
                  <MenuItem
                    key={option.id}
                    disabled={current}
                    onClick={() => void editor.move(product, option.id)}
                    className={cn(option.depth === 1 && "pl-7 text-[0.9rem]")}
                  >
                    <span className="flex-1">{option.label}</span>
                    {current && <Check aria-label="Está acá" />}
                  </MenuItem>
                );
              })}
              <MenuSeparator />
              <MenuItem
                onClick={() =>
                  editor.openSection({ onCreated: (id) => void editor.move(product, id) })
                }
                className="font-medium text-olive"
              >
                <Plus aria-hidden /> Crear sección
              </MenuItem>
            </MenuContent>
          </SubmenuRoot>
        )}

        {outToday ? (
          <MenuItem
            onClick={() =>
              run(() => setProductStock(product.id, false), [
                "Disponible otra vez",
                `«${product.name}» ya se ve normal en la carta.`,
              ])
            }
          >
            <PackageCheck aria-hidden /> Disponible otra vez
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() =>
              run(() => setProductStock(product.id, true), [
                "Sin stock por hoy",
                "Se ve atenuado en la carta y mañana vuelve solo.",
              ])
            }
          >
            <PackageX aria-hidden /> Sin stock por hoy
          </MenuItem>
        )}

        {product.isAvailable ? (
          <MenuItem
            onClick={() =>
              run(() => setProductVisibility(product.id, false), [
                "Producto oculto",
                "Ya no aparece en la web.",
              ])
            }
          >
            <EyeOff aria-hidden /> Ocultar de la carta
          </MenuItem>
        ) : (
          <MenuItem
            onClick={() =>
              run(() => setProductVisibility(product.id, true), [
                "Producto visible",
                "Ya se ve en la web.",
              ])
            }
          >
            <Eye aria-hidden /> Mostrar en la carta
          </MenuItem>
        )}

        <MenuSeparator />
        <MenuItem tone="danger" onClick={() => void onDelete()}>
          <Trash2 aria-hidden /> Eliminar
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
