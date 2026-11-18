"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { ImageField } from "@/components/admin/image-field";
import { BrandIcon, type BrandIconName } from "@/components/shared/brand-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SheetBody, SheetFooter } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toaster";
import { prepareImage, type ImageFieldValue } from "@/features/admin/media/upload";
import { CategoryBanner } from "@/features/menu/components/category-banner";
import { SubsectionHeading } from "@/features/menu/components/subsection-heading";
import { MOMENTS } from "@/features/menu/moments";
import { BRAND_IMAGES } from "@/assets/brand";
import { cn } from "@/lib/utils";

import { saveSection } from "../actions";
import { sectionSchema, type SectionInput } from "../schemas";
import type { AdminSection, DayMomentValue } from "../types";
import { describedBy, FormField, SwitchRow } from "./form-field";

const MOMENT_ICON: Record<DayMomentValue, BrandIconName> = {
  morning: "taza",
  midday: "plato",
  evening: "copa",
};

type Values = {
  name: string;
  description: string;
  moments: DayMomentValue[];
  parentId: string;
  isActive: boolean;
};

/**
 * Crear o editar una sección de la carta (con su banner). Vista previa en vivo con el
 * mismo componente de banner que la web pública.
 */
export function SectionForm({
  section,
  defaultParentId,
  sections,
  productCount = 0,
  onDirtyChange,
  registerDirtyCheck,
  onDone,
  onCancel,
}: {
  section?: AdminSection;
  defaultParentId?: string | null;
  sections: AdminSection[];
  /** Productos que ya tiene (vista previa de una subsección). */
  productCount?: number;
  onDirtyChange: (dirty: boolean) => void;
  registerDirtyCheck: (check: () => boolean) => void;
  onDone: (saved: { id: string; slug: string }) => void;
  onCancel: () => void;
}) {
  const ids = { name: useId(), description: useId(), parent: useId(), moments: useId() };
  const [image, setImage] = useState<ImageFieldValue>({ kind: "keep" });
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, control, handleSubmit, getValues, formState } = useForm<
    Values,
    unknown,
    SectionInput
  >({
    resolver: zodResolver(sectionSchema) as never,
    defaultValues: {
      name: section?.name ?? "",
      description: section?.description ?? "",
      moments: section?.moments ?? [],
      parentId: section?.parentId ?? defaultParentId ?? "",
      isActive: section?.isActive ?? true,
    },
  });

  const { errors, isSubmitting, isDirty } = formState;
  const dirty = isDirty || image.kind !== "keep";
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  useEffect(
    () => registerDirtyCheck(() => formState.isDirty || image.kind !== "keep"),
    [registerDirtyCheck, formState, image],
  );

  const [name, description, parentId] = useWatch({
    control,
    name: ["name", "description", "parentId"],
  });
  const parent = sections.find((s) => s.id === parentId);
  // Una sección con subsecciones no puede pasar a ser subsección (la carta tiene un nivel).
  const hasChildren = Boolean(section && sections.some((s) => s.parentId === section.id));
  const parentOptions = sections.filter((s) => s.parentId === null && s.id !== section?.id);

  // Subsección (va dentro de otra): en la web es solo un título con una frase, sin foto.
  const isSub = Boolean(parent);

  const previewSrc =
    image.kind === "new"
      ? image.preview
      : image.kind === "remove"
        ? null
        : (section?.imageUrl ?? null);

  const onSubmit = handleSubmit(async () => {
    setServerError(null);
    const values = getValues();
    // Una subsección no usa foto: no se sube nada ni se toca la que tuviera.
    const uploaded = await prepareImage(isSub ? { kind: "keep" } : image, "categories");
    if (!uploaded.ok) {
      setServerError(uploaded.error);
      return;
    }
    const result = await saveSection(
      section?.id ?? null,
      { ...values, parentId: values.parentId || null },
      uploaded.change,
    );
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    onDirtyChange(false);
    const kind = isSub ? "Subsección" : "Sección";
    toast.success(
      section ? `${kind} guardada` : `${kind} creada`,
      values.isActive
        ? "Se ve en la carta de la web cuando tenga al menos un producto."
        : "Está oculta: no aparece en la web.",
    );
    onDone(result.data);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <SheetBody className="flex flex-col gap-6">
        {isSub && parent ? (
          <div>
            <p className="eyebrow mb-2.5 text-[0.65rem] text-muted-foreground">
              Así se ve dentro de «{parent.name}»
            </p>
            {/* Mismo encabezado que la carta pública. Sin foto: las subsecciones no tienen banner. */}
            <div className="rounded-2xl border border-caramel/30 bg-background px-5 pt-5 pb-4">
              <SubsectionHeading
                reveal={false}
                name={name.trim() || "Nombre de la subsección"}
                description={description.trim() || null}
                count={productCount}
              />
              <div aria-hidden className="grid grid-cols-2 gap-3 opacity-60">
                <div className="h-16 rounded-xl border border-dashed border-caramel/50" />
                <div className="h-16 rounded-xl border border-dashed border-caramel/50" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Acá abajo van sus productos.</p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <p className="eyebrow mb-2.5 text-[0.65rem] text-muted-foreground">
                Así se ve en la carta
              </p>
              <CategoryBanner
                image={
                  previewSrc
                    ? {
                        src: previewSrc,
                        isStock: image.kind === "keep" && Boolean(section?.imageIsIllustrative),
                        isPending: false,
                      }
                    : { src: BRAND_IMAGES.texturaEspresso, isStock: false, isPending: true }
                }
                title={name.trim() || "Título de la sección"}
                subtitle={description.trim() || null}
                unoptimized={typeof previewSrc === "string"}
              />
            </div>

            <ImageField
              label="Foto del banner"
              hint="Se ve a la derecha del título. Una foto horizontal funciona mejor."
              currentUrl={section?.imageUrl ?? null}
              currentNote={section?.imageIsIllustrative ? "Imagen ilustrativa" : null}
              value={image}
              onChange={setImage}
              aspect="banner"
            />
          </>
        )}

        <FormField
          id={ids.name}
          label={isSub ? "Nombre de la subsección" : "Título"}
          error={errors.name?.message}
        >
          <Input
            id={ids.name}
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy(ids.name, errors.name?.message)}
            className="h-12 text-base"
            {...register("name")}
          />
        </FormField>

        <FormField
          id={ids.description}
          label="Texto breve"
          hint={
            isSub
              ? "Opcional. Una frase que explique qué hay en esta subsección."
              : "Una frase que presente la sección, debajo del título."
          }
          error={errors.description?.message}
        >
          <Textarea
            id={ids.description}
            rows={2}
            aria-invalid={Boolean(errors.description)}
            aria-describedby={describedBy(ids.description, errors.description?.message, true)}
            {...register("description")}
          />
        </FormField>

        <FormField
          id={ids.parent}
          label="¿Va dentro de otra sección?"
          hint={
            hasChildren
              ? "Esta sección tiene subsecciones, así que es una sección principal."
              : "Elegí una solo si es una subsección (por ejemplo, «Menú del día» dentro de «Almuerzos»)."
          }
        >
          <select
            id={ids.parent}
            disabled={hasChildren}
            aria-describedby={`${ids.parent}-hint`}
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
            {...register("parentId")}
          >
            <option value="">No, es una sección principal</option>
            {parentOptions.map((option) => (
              <option key={option.id} value={option.id}>
                Sí, dentro de {option.name}
              </option>
            ))}
          </select>
        </FormField>

        <fieldset className="flex flex-col gap-2" aria-describedby={`${ids.moments}-hint`}>
          <legend className="mb-2 text-[0.95rem] font-medium">Momentos del día</legend>
          <Controller
            control={control}
            name="moments"
            render={({ field }) => (
              <div className="grid grid-cols-3 gap-2">
                {MOMENTS.map((moment) => {
                  const checked = field.value.includes(moment.value);
                  return (
                    <label
                      key={moment.value}
                      className={cn(
                        "relative flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-center text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-olive",
                        checked
                          ? "border-espresso bg-espresso text-cream"
                          : "border-caramel/40 bg-card hover:border-caramel",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(event) =>
                          field.onChange(
                            event.target.checked
                              ? MOMENTS.map((m) => m.value).filter(
                                  (v) => v === moment.value || field.value.includes(v),
                                )
                              : field.value.filter((v) => v !== moment.value),
                          )
                        }
                      />
                      <BrandIcon name={MOMENT_ICON[moment.value]} className="h-6 w-7" />
                      {moment.label}
                      {checked && (
                        <Check
                          aria-hidden
                          className="absolute top-2 right-2 size-3.5 text-caramel"
                        />
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          />
          <p id={`${ids.moments}-hint`} className="text-sm text-muted-foreground">
            {parent
              ? `Si no elegís ninguno, usa los de «${parent.name}».`
              : "Las tarjetas de la home filtran la carta por momento. Sin ninguno, la sección aparece solo en la carta completa."}
          </p>
        </fieldset>

        <SwitchRow
          title="Visible en la carta"
          description="Si la apagás, la sección y sus productos no aparecen en la web."
          control={
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-label="Visible en la carta"
                />
              )}
            />
          }
        />

        {serverError && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}
      </SheetBody>

      <SheetFooter>
        <Button type="button" variant="outline" className="h-12 px-6 text-base" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="h-12 px-6 text-base" disabled={isSubmitting}>
          {isSubmitting
            ? "Guardando…"
            : section
              ? "Guardar cambios"
              : isSub
                ? "Crear subsección"
                : "Crear sección"}
        </Button>
      </SheetFooter>
    </form>
  );
}
