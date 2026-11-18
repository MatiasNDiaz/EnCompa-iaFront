"use client";

import { ExternalLink, EyeOff, PencilLine, Send, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toaster";
import { BrandIcon } from "@/components/shared/brand-icon";
import { SPECIALS_NAV_HREF } from "@/config/specials";
import { MOMENT_ICONS } from "@/features/menu/components/moment-filter";
import type { DayMoment } from "@/features/menu/moments";
import { momentLabel, scheduleLabel } from "@/features/specials/moments";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

import { clearSpecial, setSpecialPublished } from "../actions";
import type { AdminSpecial } from "../types";
import { SpecialForm } from "./special-form";

/**
 * Los 3 espacios del plato del día (Mañana · Mediodía · Tarde/Noche): cada tarjeta muestra
 * cómo está, si se ve en la web, y abre el formulario en un panel lateral.
 */
export function SpecialsBoard({ specials }: { specials: AdminSpecial[] }) {
  const confirm = useConfirm();
  const [editing, setEditing] = useState<{ moment: DayMoment; key: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const counter = useRef(0);
  const dirtyCheck = useRef<() => boolean>(() => false);
  const registerDirtyCheck = useCallback((check: () => boolean) => {
    dirtyCheck.current = check;
  }, []);

  useUnsavedChanges(open && dirty);

  const edit = (moment: DayMoment) => {
    counter.current += 1;
    setDirty(false);
    setEditing({ moment, key: counter.current });
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    setDirty(false);
    dirtyCheck.current = () => false;
  }, []);

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

  const current = editing ? specials.find((s) => s.moment === editing.moment) : undefined;

  return (
    <>
      <ul className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        {specials.map((special) => (
          <li key={special.moment} className="flex">
            <SpecialCard special={special} onEdit={() => edit(special.moment)} />
          </li>
        ))}
      </ul>

      <Sheet
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : void requestClose())}
        title={current ? `Plato del día · ${momentLabel(current.moment)}` : ""}
        description={
          current
            ? `Se muestra primero de ${scheduleLabel(current.moment)} (hora de Córdoba).`
            : undefined
        }
      >
        {current && editing && (
          <SpecialForm
            key={editing.key}
            special={current}
            onDirtyChange={setDirty}
            registerDirtyCheck={registerDirtyCheck}
            onDone={close}
            onCancel={() => void requestClose()}
          />
        )}
      </Sheet>
    </>
  );
}

function SpecialCard({ special, onEdit }: { special: AdminSpecial; onEdit: () => void }) {
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();
  const label = momentLabel(special.moment);
  const headingId = `especial-${special.moment}`;
  const isEmpty =
    !special.title &&
    !special.imagePath &&
    !special.subtitle &&
    !special.body &&
    special.price === null;
  const canPublish = Boolean(special.title && special.imagePath);

  const togglePublished = () =>
    startTransition(async () => {
      const publish = !special.isPublished;
      const result = await setSpecialPublished(special.moment, publish);
      if (!result.ok) {
        toast.error(publish ? "No se pudo publicar" : "No se pudo quitar", result.error);
        return;
      }
      toast.success(
        publish ? "Plato publicado" : "Plato quitado de la web",
        publish
          ? `Ya se ve en la web (${label.toLowerCase()}).`
          : "Ya no se ve en la web. Sus datos quedan guardados.",
      );
    });

  const clear = async () => {
    const ok = await confirm({
      title: `¿Vaciar el plato de ${label.toLowerCase()}?`,
      description:
        "Se borran la foto y los textos, y deja de verse en la web. No se puede deshacer.",
      confirmLabel: "Vaciar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });
    if (!ok) return;
    startTransition(async () => {
      const result = await clearSpecial(special.moment);
      if (!result.ok) {
        toast.error("No se pudo vaciar", result.error);
        return;
      }
      toast.success(
        "Espacio vacío",
        `El plato de ${label.toLowerCase()} quedó listo para cargar uno nuevo.`,
      );
    });
  };

  return (
    <article
      aria-labelledby={headingId}
      aria-busy={pending || undefined}
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-3xl border bg-card shadow-[0_12px_32px_-24px_rgb(72_54_41/0.45)] transition-opacity",
        special.isPublished ? "border-olive/45" : "border-caramel/25",
        pending && "opacity-70",
      )}
    >
      <div className="relative aspect-4/3 bg-secondary">
        {special.imageUrl ? (
          <Image
            src={special.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 24rem, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <BrandIcon name={MOMENT_ICONS[special.moment]} className="h-14 w-20 text-caramel" />
            <span className="text-sm">Sin foto</span>
          </div>
        )}
        <span
          className={cn(
            "absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm",
            special.isPublished ? "bg-olive text-cream" : "bg-cream/95 text-espresso",
          )}
        >
          <span
            aria-hidden
            className={cn("size-2 rounded-full", special.isPublished ? "bg-cream" : "bg-caramel")}
          />
          {special.isPublished ? "Publicado" : "Sin publicar"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow flex items-center gap-2 text-terracotta">
          <BrandIcon name={MOMENT_ICONS[special.moment]} className="h-4 w-5" />
          {scheduleLabel(special.moment)}
        </p>
        <h2 id={headingId} className="mt-2 font-serif text-[2rem] leading-tight">
          {label}
        </h2>

        {isEmpty ? (
          <p className="mt-2 text-[0.95rem] text-muted-foreground">
            Todavía no cargaste un plato para {label.toLowerCase()}.
          </p>
        ) : (
          <div className="mt-2">
            <p
              className={cn(
                "text-lg font-medium",
                !special.title && "text-muted-foreground italic",
              )}
            >
              {special.title ?? "Sin título"}
            </p>
            {special.subtitle && (
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                {special.subtitle}
              </p>
            )}
            {special.price !== null && (
              <p className="mt-2 font-serif text-xl font-semibold tabular-nums">
                {formatPrice(special.price)}
              </p>
            )}
          </div>
        )}

        {!special.isPublished && !isEmpty && !canPublish && (
          <p className="mt-3 rounded-xl bg-secondary px-3 py-2 text-sm">
            Para publicarlo falta{" "}
            {special.imagePath ? "el título" : special.title ? "la foto" : "la foto y el título"}.
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          <Button type="button" className="h-11 px-5" onClick={onEdit} disabled={pending}>
            <PencilLine aria-hidden />
            {isEmpty ? "Cargar plato" : "Editar"}
          </Button>
          {special.isPublished ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 px-4"
              onClick={togglePublished}
              disabled={pending}
            >
              <EyeOff aria-hidden />
              Quitar de la web
            </Button>
          ) : (
            canPublish && (
              <Button
                type="button"
                variant="outline"
                className="h-11 px-4"
                onClick={togglePublished}
                disabled={pending}
              >
                <Send aria-hidden />
                Publicar
              </Button>
            )
          )}
        </div>

        {(!isEmpty || special.isPublished) && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {special.isPublished && (
              <a
                href={SPECIALS_NAV_HREF}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-olive underline-offset-4 hover:underline"
              >
                <ExternalLink aria-hidden className="size-4" />
                Ver en la web
              </a>
            )}
            {!isEmpty && (
              <button
                type="button"
                onClick={() => void clear()}
                disabled={pending}
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-vermouth underline-offset-4 hover:underline disabled:opacity-50"
              >
                <Trash2 aria-hidden className="size-4" />
                Vaciar
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
